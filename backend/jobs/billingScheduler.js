import cron from "node-cron";
import {
    expirePastDueSubscriptions
} from "./expirePastDueSubscriptions.js";

export const startBillingScheduler = () => {
    cron.schedule("*/15 * * * *", async () => {
        try {
            const count = await expirePastDueSubscriptions();

            if (count > 0) {
                console.log(
                    `Expired ${count} past-due subscriptions`
                );
            }
        } catch (error) {
            console.error(
                "Billing expiry job failed:",
                error
            );
        }
    });
};