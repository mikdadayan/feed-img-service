import { S3Client } from "@aws-sdk/client-s3";

import {
  awsSecretKey,
  bucketRegion,
  awsAccessKey,
} from "../../utils/env-contstants";

export const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKey || "",
    secretAccessKey: awsSecretKey || "",
  },
  region: bucketRegion,
});
