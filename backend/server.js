import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import http from "http";
import { initializeSocket } from "./socket/socket.js";


dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();
const httpServer = http.createServer(app);

initializeSocket(httpServer);




// app.listen(process.env.PORT,() =>{
//     console.log(`Server is running on port ${process.env.PORT}`);
// })

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});