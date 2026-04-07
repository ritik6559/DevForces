import { HeadObjectCommand, ListObjectsV2Command, CopyObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "./lib/s3"
import { S3_BUCKET_NAME } from "./utils/config";


export const copyS3Folder = async (
    sourcePrefix: string,
    destinationPrefix: string,
    continuationToken?: string
): Promise<void> => {
    try {
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

                console.log(copyParams);
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
    }
}

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