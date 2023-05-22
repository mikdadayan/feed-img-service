import { Router } from "express";
import multer from "multer";

import { createPost, deletePost, getAllPosts } from "../../controllers";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/posts", getAllPosts);

router.post("/posts", upload.single("image"), createPost);

router.delete("/api/posts/:id", deletePost);

export default router;
