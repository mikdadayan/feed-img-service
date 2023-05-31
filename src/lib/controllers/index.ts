import { Request, Response } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../aws";
import { prisma } from "../db";
import { bucketName } from "../utils/env-contstants";
import { createSuccessResponse } from "../utils/response-utils";
import sharp from "sharp";
import { randomImageName } from "../utils/util-fucntions";
import { S3CommandType, createS3Command } from "../facade/createS3Command";
import CustomError from "../utils/customError";

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    for (const post of posts) {
      const command = createS3Command(S3CommandType.GET, {
        Bucket: bucketName,
        Key: post.imageName,
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 });
      post.imageUrl = url;
    }

    return createSuccessResponse(res, "List of all posts.", 200, posts);
  } catch (error) {
    throw new CustomError("Failed to fetch posts", 500);
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new CustomError("Image file is required", 400);
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();

    const imageName = randomImageName();
    const command = createS3Command(S3CommandType.PUT, {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: req.file.mimetype,
    });

    await s3.send(command);

    const post = await prisma.post.create({
      data: {
        caption: req.body.caption || "",
        imageName: String(imageName),
      },
    });

    return createSuccessResponse(res, "Created post successfully.", 201, post);
  } catch (error) {
    throw new CustomError("Failed to create post", 500);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new CustomError("Post not found", 404);
    }

    const command = createS3Command(S3CommandType.DELETE, {
      Bucket: bucketName,
      Key: post.imageName,
    });

    await s3.send(command);

    await prisma.post.delete({ where: { id } });

    return createSuccessResponse(res, "Post deleted successfully.", 204, {});
  } catch (error) {
    throw new CustomError("Failed to delete post", 500);
  }
};
