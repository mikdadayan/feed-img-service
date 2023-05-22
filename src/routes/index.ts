import { Router, Request, Response } from "express";

import { prisma } from "../lib/db";
import { bucketName } from "../utils/env-contstants";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../lib/aws";
import { createSuccessResponse } from "../utils/response-utils";

const router = Router();

router.get("/");

router.get("/posts", async (_req: Request, res: Response) => {
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

export default router;
