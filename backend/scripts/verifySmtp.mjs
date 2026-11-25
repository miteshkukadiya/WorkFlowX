import "dotenv/config";
import { isSmtpConfigured, verifySmtpConnection } from "../src/services/email.service.js";

if (!isSmtpConfigured()) {
    console.error("SMTP is incomplete. Set the SMTP variables listed in backend/.env.example.");
    process.exitCode = 1;
} else {
    try {
        await verifySmtpConnection();
        console.log("SMTP connection and authentication verified.");
    } catch (error) {
        console.error("SMTP verification failed:", error.message);
        process.exitCode = 1;
    }
}
