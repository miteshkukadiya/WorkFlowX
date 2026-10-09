import User from "../models/User.js";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio || "",
    avatar: user.avatar || "",
    preferences: {
        theme: user.preferences?.theme || "system",
        timezone: user.preferences?.timezone || "Asia/Kolkata",
        notifications: {
            taskAssigned:
                user.preferences?.notifications?.taskAssigned ?? true,
            taskStatusChanged:
                user.preferences?.notifications?.taskStatusChanged ?? true,
            comments:
                user.preferences?.notifications?.comments ?? true,
            projectInvites:
                user.preferences?.notifications?.projectInvites ?? true
        }
    }
});

// GET PROFILE
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            data: publicUser(user)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to load profile"
        });
    }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;

        if (
            typeof name !== "string" ||
            name.trim().length < 2 ||
            name.trim().length > 80
        ) {
            return res.status(400).json({
                success: false,
                message: "Name must contain 2 to 80 characters"
            });
        }

        if (
            bio !== undefined &&
            (typeof bio !== "string" || bio.length > 300)
        ) {
            return res.status(400).json({
                success: false,
                message: "Bio must be 300 characters or fewer"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.name = name.trim();

        if (bio !== undefined) {
            user.bio = bio.trim();
        }

        await user.save();

        return res.json({
            success: true,
            message: "Profile updated successfully",
            data: publicUser(user)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update profile"
        });
    }
};

// UPLOAD AVATAR
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            await fs.unlink(req.file.path).catch(() => {});

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const oldAvatar = user.avatar;

        user.avatar = `/uploads/avatars/${req.file.filename}`;

        await user.save();

        // Delete previous local avatar after saving the new one
        if (oldAvatar?.startsWith("/uploads/avatars/")) {
            const oldFilename = path.basename(oldAvatar);
            const oldPath = path.resolve(
                "uploads",
                "avatars",
                oldFilename
            );

            await fs.unlink(oldPath).catch(() => {});
        }

        return res.json({
            success: true,
            message: "Avatar updated successfully",
            data: publicUser(user)
        });

    } catch (error) {
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }

        return res.status(500).json({
            success: false,
            message: "Unable to upload avatar"
        });
    }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Both passwords are required"
            });
        }

        if (
            newPassword.length < 8 ||
            newPassword.length > 128
        ) {
            return res.status(400).json({
                success: false,
                message: "New password must be 8 to 128 characters"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different"
            });
        }

        const user = await User.findById(req.user._id)
            .select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Choose ONE hashing strategy:
        // This example assumes the User model already hashes
        // passwords using a pre-save hook.
        user.password = newPassword;
        await user.save();

        return res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to change password"
        });
    }
};

// UPDATE PREFERENCES
export const updatePreferences = async (req, res) => {
    try {
        const { theme, timezone, notifications } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (theme !== undefined) {
            if (!["light", "dark", "system"].includes(theme)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid theme"
                });
            }

            user.set("preferences.theme", theme);
        }

        if (timezone !== undefined) {
            if (
                typeof timezone !== "string" ||
                timezone.length > 80
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid timezone"
                });
            }

            try {
                new Intl.DateTimeFormat("en-US", {
                    timeZone: timezone
                });
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Unknown timezone"
                });
            }

            user.set("preferences.timezone", timezone);
        }

        if (notifications !== undefined) {
            if (
                !notifications ||
                typeof notifications !== "object" ||
                Array.isArray(notifications)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid notification preferences"
                });
            }

            const allowed = [
                "taskAssigned",
                "taskStatusChanged",
                "comments",
                "projectInvites"
            ];

            for (const [key, value] of Object.entries(notifications)) {
                if (!allowed.includes(key) || typeof value !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid notification setting: ${key}`
                    });
                }

                user.set(`preferences.notifications.${key}`, value);
            }
        }

        await user.save();

        return res.json({
            success: true,
            message: "Preferences updated successfully",
            data: publicUser(user)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update preferences"
        });
    }
};