import { S3Client } from "@aws-sdk/client-s3";
import { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } from "../utils/config";

export const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});
