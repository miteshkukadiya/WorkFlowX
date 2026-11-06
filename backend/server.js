import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import http from "http";
import { initializeSocket } from "./socket/socket.js";
import { startBillingScheduler } from "./jobs/billingScheduler.js";


dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

connectDB().then(() => {
    startBillingScheduler();
}).catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
});

initializeSocket(httpServer);




// app.listen(process.env.PORT,() =>{
//     console.log(`Server is running on port ${process.env.PORT}`);
// })

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});