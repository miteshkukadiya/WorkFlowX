import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { env } from "../config/env.js";

const allowedOrigins = [
    env.FRONTEND_URL
];

export const securityHeaders = helmet();

export const corsMiddleware = cors({
    origin(origin, callback) {
        // Allow non-browser clients such as Postman.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error("CORS origin not allowed")
        );
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 300,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 10,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    skipSuccessfulRequests: true,

    message: {
        success: false,
        message: "Too many authentication attempts. Try again later."
    }
});