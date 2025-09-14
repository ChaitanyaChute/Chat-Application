import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import authModel from "../models/authModel.js";

dotenv.config();

const authRouter = express.Router();

interface reqInterface{
    username:string,
    password:string
}

authRouter.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({
            message: "Username is required and cannot be empty",
        });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
        return res.status(400).json({
            message: "Password is required and cannot be empty",
        });
    }

    try {
        const existingUser = await authModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists, please login.",
            });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const newUser = await authModel.create({
            username,
            password: hashedPass,
        });

        res.status(201).json({
            message: "Signed up successfully",
            username: newUser.username,
        });
    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Error during signup",
        });
    }
});

authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and Password are required",
        });
    }

    try {
        const user = await authModel.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign(
                {
                    id: user._id,
                    username: user.username,
                },
                process.env.JWT_SECRET || "default_secret_key", 
                { expiresIn: "1h" } 
            );

            return res.status(200).json({
                token,
            });
        } else {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error during login",
        });
    }
});

export default authRouter;
