const dotenv = require("dotenv");
const app = require("./src/app");
const connectDB = require("./src/config/db");

dotenv.config();



connectDB();



app.listen(process.env.PORT,() =>{
    console.log(`Server is running on port ${process.env.PORT}`);
})