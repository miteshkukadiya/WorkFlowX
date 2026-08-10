const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors")
const connectDB = require("./src/config/db");

dotenv.config();


const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/" , (req , res) => {
    res.send("API is running...");
})

app.listen(process.env.PORT,() =>{
    console.log(`Server is running on port ${process.env.PORT}`);
})