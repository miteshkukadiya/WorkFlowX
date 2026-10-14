import "dotenv/config";
import mongoose from "mongoose";

import Project from "../src/models/Project.js";
import Organization from "../src/models/Organization.js";
import OrganizationMember from "../src/models/OrganizationMember.js";

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const ownerIds = await Project.distinct("owner", {
            organization: { $exists: false }
        });

        console.log(`Found ${ownerIds.length} project owners`);

        for (const ownerId of ownerIds) {
            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    let organization = await Organization.findOne({
                        owner: ownerId,
                        name: "Personal Workspace"
                    }).session(session);

                    if (!organization) {
                        const [created] = await Organization.create(
                            [{
                                name: "Personal Workspace",
                                slug: `personal-${ownerId}`,
                                owner: ownerId
                            }],
                            { session }
                        );

                        organization = created;
                    }

                    await OrganizationMember.updateOne(
                        {
                            organization: organization._id,
                            user: ownerId
                        },
                        {
                            $setOnInsert: {
                                role: "owner",
                                status: "active"
                            }
                        },
                        {
                            upsert: true,
                            session
                        }
                    );

                    await Project.updateMany(
                        {
                            owner: ownerId,
                            organization: { $exists: false }
                        },
                        {
                            $set: {
                                organization: organization._id
                            }
                        },
                        { session }
                    );
                });

                console.log(`Migrated projects for owner ${ownerId}`);
            } finally {
                await session.endSession();
            }
        }

        const remaining = await Project.countDocuments({
            $or: [
                { organization: { $exists: false } },
                { organization: null }
            ]
        });

        console.log(`Projects without organizations: ${remaining}`);

        if (remaining > 0) {
            throw new Error("Migration verification failed");
        }

        console.log("Organization migration completed");

    } catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

migrate();