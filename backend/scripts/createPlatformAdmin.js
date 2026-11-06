const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const User = require("../src/models/User");
const PlatformAdmin = require("../src/models/PlatformAdmin");

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});

const createPlatformAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing");
        }

        const email = process.env.PLATFORM_ADMIN_EMAIL
            ?.trim()
            .toLowerCase();

        if (!email) {
            throw new Error("PLATFORM_ADMIN_EMAIL is missing");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const user = await User.findOne({ email });

        if (!user) {
            throw new Error(
                "User not found. Register this user normally first."
            );
        }

        const existingAdmin = await PlatformAdmin.findOne({
            user: user._id
        });

        if (existingAdmin) {
            throw new Error(
                "This user already has a Platform Admin record."
            );
        }

        await PlatformAdmin.create({
            user: user._id,
            status: "active"
        });

        console.log("Platform Admin created successfully");
        console.log("Email:", user.email);
    } catch (error) {
        console.error("Platform Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createPlatformAdmin();