import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum([
        "development",
        "test",
        "production"
    ]).default("development"),

    PORT: z.coerce.number().int().min(1).max(65535).default(5000),

    MONGO_URI: z.string().min(1),

    JWT_SECRET: z.string().min(32),

    FRONTEND_URL: z.string().url(),

    EMAIL_FROM: z.string().min(1).optional(),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    SMTP_SECURE: z.enum(["true", "false"]).optional(),

    RAZORPAY_KEY_ID: z.string().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().min(1).optional(),

    RAZORPAY_WEBHOOK_SECRET: z.string().min(16).optional(),

    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional()
}).superRefine((values, context) => {
    const smtpKeys = [
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASSWORD",
        "EMAIL_FROM"
    ];
    const configuredCount = smtpKeys.filter(key => Boolean(values[key])).length;
    const smtpConfigured = configuredCount === smtpKeys.length;

    if (
        (configuredCount > 0 && !smtpConfigured) ||
        (values.NODE_ENV === "production" && !smtpConfigured)
    ) {
        context.addIssue({
            code: "custom",
            path: ["SMTP_HOST"],
            message: "Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and EMAIL_FROM together; SMTP is required in production."
        });
    }
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("Invalid environment configuration");

    for (const issue of result.error.issues) {
        console.error(
            `${issue.path.join(".")}: ${issue.message}`
        );
    }

    process.exit(1);
}

export const env = result.data;