import crypto from "crypto";
import express, { Request, Response } from "express";
import multer from "multer";
import dotenv from "dotenv";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

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
  res.send(posts);
});

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

    res.json(post);
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
