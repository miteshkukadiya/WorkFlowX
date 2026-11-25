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
        const secure = process.env.SMTP_SECURE === "true";
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure,
            requireTLS: !secure,
            connectionTimeout: 15_000,
            greetingTimeout: 15_000,
            socketTimeout: 30_000,
            tls: {
                minVersion: "TLSv1.2"
            },
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    return transporter;
};

export const isSmtpConfigured = smtpConfigured;

export const verifySmtpConnection = async () => {
    const mailer = getTransporter();

    if (!mailer) {
        throw new Error("SMTP configuration is incomplete");
    }

    await mailer.verify();
};

export const sendEmail = async ({ to, subject, text, html }) => {
    const mailer = getTransporter();

    if (!mailer) {
        console.warn("Email skipped: SMTP configuration is incomplete");
        return false;
    }

    const result = await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html
    });

    const accepted = result.accepted?.some(recipient => {
        const address = typeof recipient === "string"
            ? recipient
            : recipient.address;
        return address?.toLowerCase() === to.toLowerCase();
    });

    if (!accepted) {
        throw new Error("SMTP server did not accept the email recipient");
    }

    return true;
};

export default { sendEmail, isSmtpConfigured, verifySmtpConnection };
