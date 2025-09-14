import { WebSocketServer,WebSocket } from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import chatModel from "../models/chatModel.js";
import { dbconnect } from "../libs/db.js";
import jwt from "jsonwebtoken";

const wss = new WebSocketServer({port:8080});

dotenv.config()
dbconnect()

interface customWebSocket extends WebSocket{
    username?:string;
    currentRoom?:string | null ;
    userId?:string;
    authenticated?:boolean
}

let userCount = 0 ;
let users:customWebSocket[]= [];
const rooms = new Map<string,Set<customWebSocket>>();
const history = new Map<string,any[]>();

wss.on("connection",(ws)=>{

    const Customws = ws as customWebSocket;


    users.push(ws);
    userCount++;
    console.log("connection established , TotalUsers :"+userCount);

    Customws.username = "anon";
    Customws.currentRoom = null;
    Customws.authenticated = false;

    Customws.on("message",async (msg)=>{
        const data = JSON.parse(msg.toString())

        if(data.type == "auth"){
            try {
                const decoded = jwt.verify(
                    data.token,
                    process.env.JWT_SECRET || ""
                ) as{id:string , username:string}

                Customws.username = decoded.username;
                Customws.userId = decoded.id;
                Customws.authenticated = true;
                
                Customws.send(JSON.stringify({
                    type: "auth",
                    success: true,
                    username: Customws.username,
                    })
                )
                return;

            } catch (error) {
                Customws.send("error in authentication")
                console.log(error);
                
                Customws.send(JSON.stringify({ type: "auth", success: false }));
                //Customws.close(1008, "Invalid token");
                return;
            }
        }

        if(!Customws.authenticated){
            Customws.send(JSON.stringify({
                error:"Authenticate First"
            }))
            return;
        }

        if(data.type == "username"){
            Customws.username = data.username || "anon";
            
            const outputData = JSON.stringify({
                "type":data.type,
                "payload":{
                    "username":data.username 
                }
            })

            Customws.send(outputData)
        }

        if(data.type == "join"){
            const room = data.room;

            if(!rooms.has(room)){
                rooms.set(room , new Set());
                history.set(room,[]);
            }

            Customws.currentRoom = room ;
            rooms.get(room)!.add(Customws);

            ws.send(JSON.stringify({
                type: "history",
                room,
                messages: history.get(room)
            }));
            
            }

        if(data.type == "chat"){
            try {
                const message = data.message;

            if(!Customws.currentRoom){
                Customws.send("Join the room first");
                return;
            }
            
            const newMsg = {
            
                    from:Customws.username,
                    message:data.message,
                    room:Customws.currentRoom,
                    timestamp : new Date()
                    
                }

            const roomHistory = history.get(Customws.currentRoom);

            if (roomHistory) {
                roomHistory.push(newMsg);
                if (roomHistory.length > 50) {
                       roomHistory.shift();
                }
            }


            await chatModel.create(newMsg);
            
            const findRoom = rooms.get(Customws.currentRoom);
            const broadCast = JSON.stringify({ type:"message" , ...newMsg })
            
            findRoom?.forEach(client =>{
                const customClient = client as customWebSocket ; 
                if(customClient.readyState === customClient.OPEN ){
                    customClient.send(broadCast);
                }
            })
        }
             catch (error) {
                console.log(error);
                
                Customws.send(JSON.stringify(error))
            }
        }
    })
    
    ws.on("close",()=>{
    userCount--;
    users = users.filter( x=> x != ws)
    console.log("connection disconnected , TotalUsers :"+userCount);
})

    
})

