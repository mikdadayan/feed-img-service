import express, { Request, Response } from "express";
import multer from "multer";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
dotenv.config();

const awsSecretKey = process.env.AWS_SECRET_KEY;
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const awsAccessKey = process.env.AWS_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKey || "",
    secretAccessKey: awsSecretKey || "",
  },
  region: bucketRegion,
});

const app = express();
const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/api/posts", async (req: Request, res: Response) => {
  const posts = await prisma.posts.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  res.send(posts);
});

app.post(
  "/api/posts",
  upload.single("image"),
  (req: Request, res: Response) => {
    const params = {
      Bucket: bucketName,
      Key: req.file?.originalname,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };
    const command = new PutObjectCommand(params);

    res.send({});
  }
);

app.delete("/api/posts/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;

  res.send({});
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
