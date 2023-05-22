import express, { Request, Response } from "express";
import multer from "multer";
import dotenv from "dotenv";
import sharp from "sharp";
import cors from "cors";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createSuccessResponse } from "./utils/response-utils";
import { randomImageName } from "./utils/util-fucntions";
import { prisma } from "./lib/db";
import { bucketName } from "./utils/env-contstants";
import { s3 } from "./lib/aws";
import CustomError from "./utils/customError";

const options: cors.CorsOptions = {
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

dotenv.config();

const app = express();

app.use(cors(options));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/api/posts", async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  for (const post of posts) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: post.imageName,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 });
    post.imageUrl = url;
  }

  return createSuccessResponse(res, "List of all posts.", 200, posts);
});

// app.use("/api", postRouter);
app.post(
  "/api/posts",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const buffer = await sharp(req.file?.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();
    const imageName = randomImageName();

    // Upload the file to S3
    const s3UploadParams = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: req.file?.mimetype,
    };
    const command = new PutObjectCommand(s3UploadParams);
    await s3.send(command);

    // Create the post metadata in the database
    const post = await prisma.post.create({
      data: {
        caption: req.body.caption || "",
        imageName: String(imageName),
      },
    });

    return createSuccessResponse(res, "Created post successfully.", 201, post);
  }
);

app.delete("/api/posts/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;
  const post = await prisma.posts.findUnique({ where: { id } });
  if (!post) {
    res.status(404).send("Post not found");
    return;
  }
  const params = {
    Bucket: bucketName,
    Key: post.imageName,
  };

  const command = new DeleteObjectCommand(params);

  await s3.send(command);

  await prisma.posts.delete({ where: { id } });

  return createSuccessResponse(res, "Post deleted successfuly.", 204, {});
});

app.use((error: CustomError, _req: Request, res: Response) => {
  res.status(error.statusCode).json({ success: false, error: error.message });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, msg: "404, Page Not Found." });
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
