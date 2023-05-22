"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./lib/routes/postRouter/index"));
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
app.use("/api", index_1.default);
app.use((error, _req, res, _next) => {
    console.log(res);
    res.status(error.statusCode).json({ success: false, error: error.message });
});
app.use((_req, res) => {
    res.status(404).json({ success: false, msg: "404, Page Not Found." });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map