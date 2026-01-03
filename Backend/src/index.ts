import express from "express";
import authRouter from "./routes/authRoute.js";
import { dbconnect } from "./libs/db.js";
import dotenv from "dotenv";
import cors from "cors";
import roomRouter from "./routes/roomRoute.js";
import dmRoute from "./routes/dmRoute.js";
import messageRoute from "./routes/messageRoute.js";
import activityRoute from "./routes/activityRoute.js";
import userRoute from "./routes/userRoute.js";


dbconnect();
dotenv.config();


const port = process.env.PORT || 3000 ;


const app = express();
app.use(express.json());

const allowedOrigins = [
    process.env.FRONTEND_URL
]

app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));


app.use("/auth",authRouter)
app.use("/rooms",roomRouter)
app.use("/dm",dmRoute)
app.use("/msg",messageRoute)
app.use("/activity",activityRoute)
app.use("/users",userRoute)


app.listen(port ,()=>{
    console.log(`port is running on port"${port}`);
    
});