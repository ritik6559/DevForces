import { HeadObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "./lib/s3"

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