import { config } from "dotenv";

config();

const get = (key: string): string => {
    console.log(key)
    const value = process.env[key];
    if (!value) throw new Error(`Missing environment variable: ${key}`);
    return value;
};

export const AWS_ACCESS_KEY        = get("AWS_ACCESS_KEY");
export const AWS_SECRET_ACCESS_KEY = get("AWS_SECRET_ACCESS_KEY");
export const AWS_REGION            = get("AWS_REGION");
export const S3_BUCKET_NAME        = get("S3_BUCKET_NAME");