import { HeadObjectCommand, ListObjectsV2Command, CopyObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "./lib/s3"
import { S3_BUCKET_NAME } from "./utils/config";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

export const fetchS3Folder = async (key: string, localPath: string): Promise<void> => {
  try {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: key,
      })
    );

    if (!response.Contents || response.Contents.length === 0) return;

    for (const file of response.Contents) {
      const fileKey = file.Key;
      if (!fileKey) continue;

      try {
        const data = await s3.send(
          new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: fileKey,
          })
        );

        if (!data.Body) continue;

        const fileData = Buffer.from(await data.Body.transformToByteArray());
        const filePath = path.join(localPath, fileKey.replace(key, ""));

        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(filePath, fileData);
      } catch (fileErr) {
        console.error(`Failed to fetch or write file: ${fileKey}`, fileErr);
      }
    }
  } catch (err) {
    console.error(`Failed to fetch S3 folder: ${key}`, err);
    throw err;
  }
};

export const copyS3Folder = async (
    sourcePrefix: string,
    destinationPrefix: string,
    continuationToken?: string
): Promise<void> => {
    try {
        // Ensure destination "folder" exists (only on the first call, not recursive ones)
        if (!continuationToken) {
            await ensureS3FolderExists(destinationPrefix);
        }

        const listedObjects = await s3.send(
            new ListObjectsV2Command({
                Bucket: S3_BUCKET_NAME,
                Prefix: sourcePrefix,
                ContinuationToken: continuationToken,
            })
        );

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            return;
        }

        await Promise.all(
            listedObjects.Contents.map(async (object) => {
                if (!object.Key) return;

                const destinationKey = object.Key.replace(sourcePrefix, destinationPrefix);

                const copyParams = {
                    Bucket: S3_BUCKET_NAME,
                    CopySource: `${S3_BUCKET_NAME}/${object.Key}`,
                    Key: destinationKey,
                };

                await s3.send(new CopyObjectCommand(copyParams));
                console.log(`Copied ${object.Key} to ${destinationKey}`);
            })
        );

        if (listedObjects.IsTruncated) {
            await copyS3Folder(
                sourcePrefix,
                destinationPrefix,
                listedObjects.NextContinuationToken
            );
        }
    } catch (error) {
        console.error("Error copying folder:", error);
        throw error; // re-throw so callers know it failed
    }
};

/**
 * Creates a virtual S3 "folder" by putting a zero-byte object at
 * `${prefix}/` if one doesn't already exist.
 */
const ensureS3FolderExists = async (prefix: string): Promise<void> => {
    // Normalise: S3 folder markers always end with /
    const folderKey = prefix.endsWith("/") ? prefix : `${prefix}/`;

    try {
        // Check if the folder marker already exists
        await s3.send(
            new HeadObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: folderKey,
            })
        );
        // HeadObject succeeded → folder already exists, nothing to do
    } catch (error: any) {
        const isNotFound =
            error?.name === "NotFound" ||
            error?.$metadata?.httpStatusCode === 404;

        if (!isNotFound) {
            // Unexpected error (permissions, network, etc.) — bubble up
            throw error;
        }

        // Folder doesn't exist → create the zero-byte marker
        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: folderKey,
                Body: "",
            })
        );
        console.log(`Created destination folder: ${folderKey}`);
    }
};

export const saveToS3 = async (
    key: string,
    filePath: string,
    content: string
): Promise<void> => {
    await s3.send(
        new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: `${key}${filePath}`,
            Body: content,
        })
    );
};

export const fileExists = async (bucket: string, key: string) => {
    try {
        await s3.send(new HeadObjectCommand({
            Bucket: bucket,
            Key: key
        }));

        return true;
    } catch (err) {
        if (err instanceof Error) {
            if ((err as any).name === "NotFound") {
                return false;
            }
        }

        if ((err as any)?.$metadata?.httpStatusCode === 404) {
            return false;
        }

        throw err;
    }
}