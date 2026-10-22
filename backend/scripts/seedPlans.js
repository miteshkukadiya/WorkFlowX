import "dotenv/config";
import mongoose from "mongoose";
import Plan from "../src/models/Plan.js";

const plans = [
    {
        code: "free",
        name: "Free",
        price: 0,
        limits: {
            maxProjects: 2,
            maxMembers: 3
        },
        features: {
            advancedReports: false,
            timeTracking: false,
            automations: false
        }
    },
    {
        code: "pro",
        name: "Pro",
        price: 49900,
        limits: {
            maxProjects: 20,
            maxMembers: 15
        },
        features: {
            advancedReports: true,
            timeTracking: true,
            automations: false
        }
    },
    {
        code: "business",
        name: "Business",
        price: 149900,
        limits: {
            maxProjects: -1,
            maxMembers: 50
        },
        features: {
            advancedReports: true,
            timeTracking: true,
            automations: true
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        for (const plan of plans) {
            await Plan.updateOne(
                { code: plan.code },
                {
                    $set: {
                        name: plan.name,
                        price: plan.price,
                        limits: plan.limits,
                        features: plan.features,
                        currency: "INR",
                        interval: "monthly",
                        isActive: true
                    },
                    $setOnInsert: {
                        code: plan.code
                    }
                },
                { upsert: true }
            );
        }

        console.log("Subscription plans seeded");
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seed();