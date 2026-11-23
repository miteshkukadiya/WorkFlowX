import { v2 as cloudinary } from "cloudinary";

const isConfigured = () =>
    Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
};

export const uploadToCloudinary = async (
    buffer,
    {
        folder,
        mimeType,
        originalName
    }
) => {
    if (!isConfigured()) {
        throw new Error("Cloudinary is not configured");
    }
    configureCloudinary();

    const resourceType =
        mimeType?.startsWith("image/")
            ? "image"
            : "raw";

    return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                use_filename: true,
                unique_filename: true,
                filename_override: originalName
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes,
                    mimeType
                });
            }
        );

        upload.end(buffer);
    });
};

export const deleteFromCloudinary = async (
    publicId,
    mimeType
) => {
    if (!publicId || !isConfigured()) return;
    configureCloudinary();

    await cloudinary.uploader.destroy(
        publicId,
        {
            resource_type:
                mimeType?.startsWith("image/")
                    ? "image"
                    : "raw",
            invalidate: true
        }
    );
};
