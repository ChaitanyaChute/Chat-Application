import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt"
import authModel from "../models/authModel.js";

dotenv.config()


const authRouter = express.Router();


authRouter.post("/signup",async (req,res)=>{
    const{username,password} = req.body;

    const existing = await authModel.findOne({username})
    if(existing) {
        res.json({
            message:"userAlready exist , Please Login"
        })
        return ;
    }
    
    try {
        const HashedPass = await bcrypt.hash(password , 10);
        
        await authModel.create({
            username,
            password : HashedPass
        })

        res.json({
            message:"Signed up Sucessfully",
            Username : username 
        })
        
    } 
    catch (error) {
        res.json({
            error:"Error in auth"
        })
        console.log(error);
        
    }
})

authRouter.post("/login",async(req,res)=>{
    const{username,password} = req.body;

    const User = await authModel.findOne({
        username
    })

    const passwordMatch = await bcrypt.compare(password,User!.password)

    if(passwordMatch){
        const token = await jwt.sign({
            id:User!._id,
            username:username
    },process.env.JWT_SECRET || "")

        res.status(200).json({
            message:"Login Sucessfully",
            token:token
        })
    }

    else{
        res.json({
            "message":"invalid credentials"
        })
    }

    
})


export default authRouter;
