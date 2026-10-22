import "dotenv/config";
import mongoose from "mongoose";

import Organization from "../src/models/Organization.js";

import {
    getOrCreateFreeSubscription
} from "../services/subscription.service.js";

async function initialize() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const organizations = await Organization.find()
            .select("_id")
            .lean();

        for (const organization of organizations) {
            await getOrCreateFreeSubscription(
                organization._id
            );
        }

        console.log(
            `Checked ${organizations.length} workspace subscriptions`
        );
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

initialize();