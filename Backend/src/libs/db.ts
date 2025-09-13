import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

export const dbconnect = async()=>{
    try {
        const db_url = process.env.MONGODB_URL as string;
        await mongoose.connect(db_url)
        console.log("db connected");
        
    } catch (error) {
        console.log(error);
    }    
}


