import nodemailer from "nodemailer";

const smtpConfigured = () =>
    Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD &&
        process.env.EMAIL_FROM
    );

let transporter;

const getTransporter = () => {
    if (!smtpConfigured()) {
        return null;
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
    const mailer = getTransporter();

    if (!mailer) {
        console.warn("Email skipped: SMTP configuration is incomplete");
        return false;
    }

    await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html
    });

    return true;
};

export default { sendEmail };
