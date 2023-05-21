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
const client_1 = require("@prisma/client");
const client_s3_1 = require("@aws-sdk/client-s3");
dotenv_1.default.config();
const awsSecretKey = process.env.AWS_SECRET_KEY;
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const awsAccessKey = process.env.AWS_ACCESS_KEY;
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: awsAccessKey || "",
        secretAccessKey: awsSecretKey || "",
    },
    region: bucketRegion,
});
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
app.get("/api/posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield prisma.posts.findMany({
        orderBy: [{ createdAt: "desc" }],
    });
    res.send(posts);
}));
app.post("/api/posts", upload.single("image"), (req, res) => {
    var _a, _b, _c;
    const params = {
        Bucket: bucketName,
        Key: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
        Body: (_b = req.file) === null || _b === void 0 ? void 0 : _b.buffer,
        ContentType: (_c = req.file) === null || _c === void 0 ? void 0 : _c.mimetype,
    };
    const command = new client_s3_1.PutObjectCommand(params);
    res.send({});
});
app.delete("/api/posts/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = +req.params.id;
    res.send({});
}));
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map