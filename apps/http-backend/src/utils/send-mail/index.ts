import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ejs from "ejs";
import path from "path";
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_SERVICE, SMTP_USER } from '../config';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    service: SMTP_SERVICE,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        "src",
        "utils",
        "email-templates",
        `${templateName}.ejs`
    );

    return ejs.renderFile(templatePath, data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendMail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
    try {
        const html = await renderEmailTemplate(templateName, data);

        await transporter.sendMail({
            from: `<${process.env.SMTP_USER}`,
            to,
            subject,
            html
        });

        return true;
    } catch (err) {
        console.log("Error sending mail", err);
        return false;
    }
}