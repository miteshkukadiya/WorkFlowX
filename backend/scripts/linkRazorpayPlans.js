import "dotenv/config";
import mongoose from "mongoose";
import Plan from "../src/models/Plan.js";

const planIds = {
    pro: "plan_TtMY6xyQ6JIHh8",
    business: "plan_TtMX9McOjc445Q"
};

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        for (const [code, razorpayPlanId] of Object.entries(planIds)) {
            if (!/^plan_[a-zA-Z0-9]+$/.test(razorpayPlanId)) {
                throw new Error(`Invalid Razorpay plan ID for ${code}`);
            }

            const plan = await Plan.findOneAndUpdate(
                { code, isActive: true },
                { $set: { razorpayPlanId } },
                { new: true }
            );

            if (!plan) throw new Error(`Plan ${code} not found`);

            console.log(`${code}: ${plan.razorpayPlanId}`);
        }
    } finally {
        await mongoose.disconnect();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});