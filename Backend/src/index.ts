import express from "express";
import { json } from "stream/consumers";
import authRouter from "./routes/authRoute.js";
import { dbconnect } from "./libs/db.js";

dbconnect();

const app = express();
app.use(express.json())

app.use("/auth",authRouter)


app.listen(3000);