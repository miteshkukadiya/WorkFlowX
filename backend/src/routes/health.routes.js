import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
    const databaseConnected =
        mongoose.connection.readyState === 1;

    return res.status(
        databaseConnected ? 200 : 503
    ).json({
        success: databaseConnected,
        status: databaseConnected
            ? "healthy"
            : "unavailable",
        database: databaseConnected
            ? "connected"
            : "disconnected",
        timestamp: new Date().toISOString()
    });
});

export default router;