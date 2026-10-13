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

    FRONTEND_URL: z.string().url()
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