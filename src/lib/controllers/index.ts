import { Router, Request, Response } from "express";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../aws";
import { prisma } from "../db";
import { bucketName } from "../utils/env-contstants";
import { createSuccessResponse } from "../utils/response-utils";
import sharp from "sharp";
import { randomImageName } from "../utils/util-fucntions";

export const getAllPosts = async (_req: Request, res: Response) => {
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
};

export const createPost = async (req: Request, res: Response) => {
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
};

export const deletePost = async (req: Request, res: Response) => {
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
};
