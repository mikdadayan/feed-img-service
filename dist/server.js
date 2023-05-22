"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const sharp_1 = __importDefault(require("sharp"));
const cors_1 = __importDefault(require("cors"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const response_utils_1 = require("./utils/response-utils");
const util_fucntions_1 = require("./utils/util-fucntions");
const db_1 = require("./lib/db");
const env_contstants_1 = require("./utils/env-contstants");
const aws_1 = require("./lib/aws");
const options = {
    origin: "*",
    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
    ],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
};
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)(options));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
app.get("/api/posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield db_1.prisma.post.findMany({
        orderBy: [{ createdAt: "desc" }],
    });
    for (const post of posts) {
        const getObjectParams = {
            Bucket: env_contstants_1.bucketName,
            Key: post.imageName,
        };
        const command = new client_s3_1.GetObjectCommand(getObjectParams);
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3, command, { expiresIn: 60 * 60 });
        post.imageUrl = url;
    }
    return (0, response_utils_1.createSuccessResponse)(res, "List of all posts.", 200, posts);
}));
// app.use("/api", postRouter);
app.post("/api/posts", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const buffer = yield (0, sharp_1.default)((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();
    const imageName = (0, util_fucntions_1.randomImageName)();
    // Upload the file to S3
    const s3UploadParams = {
        Bucket: env_contstants_1.bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: (_b = req.file) === null || _b === void 0 ? void 0 : _b.mimetype,
    };
    const command = new client_s3_1.PutObjectCommand(s3UploadParams);
    yield aws_1.s3.send(command);
    // Create the post metadata in the database
    const post = yield db_1.prisma.post.create({
        data: {
            caption: req.body.caption || "",
            imageName: String(imageName),
        },
    });
    return (0, response_utils_1.createSuccessResponse)(res, "Created post successfully.", 201, post);
}));
app.delete("/api/posts/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = +req.params.id;
    const post = yield db_1.prisma.posts.findUnique({ where: { id } });
    if (!post) {
        res.status(404).send("Post not found");
        return;
    }
    const params = {
        Bucket: env_contstants_1.bucketName,
        Key: post.imageName,
    };
    const command = new client_s3_1.DeleteObjectCommand(params);
    yield aws_1.s3.send(command);
    yield db_1.prisma.posts.delete({ where: { id } });
    return (0, response_utils_1.createSuccessResponse)(res, "Post deleted successfuly.", 204, {});
}));
app.use((error, _req, res) => {
    res.status(error.statusCode).json({ success: false, error: error.message });
});
app.use((_req, res) => {
    res.status(404).json({ success: false, msg: "404, Page Not Found." });
});
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map