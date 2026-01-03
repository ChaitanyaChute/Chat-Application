import { WebSocketServer,WebSocket } from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import chatModel from "../models/chatModel.js";
import { dbconnect } from "../libs/db.js";
import jwt from "jsonwebtoken";
import activityModel from "../models/activityModel.js";
import authModel from "../models/authModel.js";
import { wsBus } from "../libs/wsBus.js";

dotenv.config()
dbconnect()

const ws_port =Number(process.env.WS_PORT) || 8080 ;

console.log("Websocket server connected on port",ws_port);

const wss = new WebSocketServer({port:ws_port});


interface customWebSocket extends WebSocket{
    username?:string;
    currentRoom?:string | null ;
    userId?:string;
    authenticated?:boolean;
    isAlive?:boolean;
    pingInterval?:NodeJS.Timeout;
}

let userCount = 0 ;
let users:customWebSocket[]= [];
const rooms = new Map<string,Set<customWebSocket>>();
const history = new Map<string,any[]>();

const userSockets = new Map<string, customWebSocket>();

// Helper function to broadcast activity to all authenticated users
export const broadcastActivity = (activity: any) => {
    const activityMessage = JSON.stringify({
        type: "activity",
        activity
    });
    
    users.forEach(client => {
        const customClient = client as customWebSocket;
        // Don't send activity to the user who triggered it
        if (customClient.authenticated && 
            customClient.readyState === WebSocket.OPEN &&
            customClient.userId !== activity.userId) {
            customClient.send(activityMessage);
        }
    });
};

// Helper function to broadcast new message notification to all users
export const broadcastNewMessage = (messageData: any) => {
    const notification = JSON.stringify({
        type: "new_message",
        data: messageData
    });
    
    users.forEach(client => {
        const customClient = client as customWebSocket;
        if (customClient.authenticated && customClient.readyState === WebSocket.OPEN) {
            customClient.send(notification);
        }
    });
};

// Listen to process-wide bus and relay to connected clients
wsBus.on('activity', (activity: any) => {
    try {
        broadcastActivity(activity);
    } catch (err) {
        console.error('Error relaying activity:', err);
    }
});

wsBus.on('new_message', (messageData: any) => {
    try {
        broadcastNewMessage(messageData);
    } catch (err) {
        console.error('Error relaying new_message:', err);
    }
});

wss.on("connection",(ws)=>{

    const Customws = ws as customWebSocket;


    users.push(ws);
    userCount++;
    console.log("connection established , TotalUsers :"+userCount);

    Customws.username = "anon";
    Customws.currentRoom = null;
    Customws.authenticated = false;    Customws.isAlive = true;

    // Handle pong responses
    Customws.on('pong', () => {
        Customws.isAlive = true;
    });
    Customws.on("message",async (msg)=>{
        try {
            
        const data = JSON.parse(msg.toString())

        if(data.type == "auth"){
            try {
                const decoded = jwt.verify(
                    data.token,
                    process.env.JWT_SECRET || ""
                ) as{id:string , username:string}

                if (!decoded.username) {
                    Customws.send(
                    JSON.stringify({
                    type: "auth",
                    success: false,
                    reason: "Username missing in JWT",
                })
                );
                 return;
                }

                Customws.username = decoded.username;
                Customws.userId = decoded.id;
                Customws.authenticated = true;

                userSockets.set(Customws.userId, Customws);
                
                // Update user status to online in database
                await authModel.findByIdAndUpdate(
                    decoded.id,
                    { status: "online" },
                    { new: true }
                );
                
                // Start ping-pong heartbeat for authenticated users
                Customws.pingInterval = setInterval(() => {
                    if (Customws.isAlive === false) {
                        console.log(`Terminating dead connection for user: ${Customws.username}`);
                        clearInterval(Customws.pingInterval);
                        return Customws.terminate();
                    }
                    
                    Customws.isAlive = false;
                    Customws.ping();
                }, 30000); // Ping every 30 seconds
                
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

        // Handle ping from client
        if(data.type === "ping"){
            Customws.isAlive = true;
            Customws.send(JSON.stringify({ type: "pong" }));
            return;
        }

        if(data.type == "join"){
            const room = data.room;

            if(!rooms.has(room)){
                rooms.set(room , new Set());
                history.set(room,[]);
            }

            // Verify user is a member of the room
            try {
                const roomModel = (await import("../models/roomModel.js")).default;
                const roomData = await roomModel.findOne({ name: room });
                
                if (!roomData) {
                    Customws.send(JSON.stringify({
                        type: "error",
                        message: "Room not found"
                    }));
                    return;
                }
                
                // Check if user is a member
                const isMember = roomData.members?.some(m => m.toString() === Customws.userId);
                if (!isMember) {
                    Customws.send(JSON.stringify({
                        type: "error",
                        message: "You are not a member of this room. Please join first."
                    }));
                    return;
                }
            } catch (error) {
                console.error("Error checking room membership:", error);
                Customws.send(JSON.stringify({
                    type: "error",
                    message: "Error accessing room"
                }));
                return;
            }

            Customws.currentRoom = room ;
            rooms.get(room)!.add(Customws);

            // Update room online count in database
            const onlineCount = rooms.get(room)!.size;
            try {
                const roomModel = (await import("../models/roomModel.js")).default;
                await roomModel.findOneAndUpdate(
                    { name: room },
                    { online: onlineCount },
                    { new: true }
                );
                
                // Broadcast updated count to all room members
                const updateMsg = JSON.stringify({
                    type: "room_update",
                    room,
                    online: onlineCount
                });
                rooms.get(room)!.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(updateMsg);
                    }
                });
            } catch (error) {
                console.error("Error updating room count:", error);
            }

            // Load persistent messages from database
            try {
                const dbMessages = await chatModel
                    .find({ room })
                    .sort({ createdAt: 1 })
                    .limit(100);
                
                const formattedMessages = dbMessages.map(msg => ({
                    from: msg.from,
                    message: msg.message,
                    room: msg.room,
                    timestamp: (msg as any).createdAt || new Date()
                }));
                
                // Update in-memory history if empty
                if (history.get(room)!.length === 0 && formattedMessages.length > 0) {
                    history.set(room, formattedMessages.slice(-50)); // Keep last 50 in memory
                }
                
                ws.send(JSON.stringify({
                    type: "history",
                    room,
                    messages: formattedMessages
                }));
            } catch (error) {
                console.error("Error loading room history:", error);
                ws.send(JSON.stringify({
                    type: "history",
                    room,
                    messages: history.get(room)
                }));
            }
            
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
            
            // Update room's lastMessageAt timestamp
            try {
                const roomModel = (await import("../models/roomModel.js")).default;
                await roomModel.findOneAndUpdate(
                    { name: Customws.currentRoom },
                    { lastMessageAt: new Date() },
                    { new: true }
                );
            } catch (error) {
                console.error("Error updating room lastMessageAt:", error);
            }
            
            // Create activity for room message
            const activity = await activityModel.create({
                type: "message_sent",
                title: `${Customws.username} sent a message`,
                description: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
                userId: Customws.userId,
                username: Customws.username,
                roomId: Customws.currentRoom,
                roomName: Customws.currentRoom,
                timestamp: new Date()
            });
            
            // Get room members
            const roomModel = (await import("../models/roomModel.js")).default;
            const roomData = await roomModel.findOne({ name: Customws.currentRoom });
            const roomMemberIds = roomData?.members?.map(m => m.toString()) || [];
            
            // Broadcast activity only to room members
            const activityBroadcast = JSON.stringify({
                type: "activity",
                activity: {
                    id: activity._id,
                    type: activity.type,
                    title: activity.title,
                    description: activity.description,
                    userId: activity.userId,
                    username: activity.username,
                    roomName: activity.roomName,
                    timestamp: activity.timestamp
                }
            });
            
            users.forEach(client => {
                const customClient = client as customWebSocket;
                if (customClient.authenticated && 
                    customClient.readyState === WebSocket.OPEN && 
                    customClient.userId && 
                    customClient.userId !== Customws.userId && // Don't send to self
                    roomMemberIds.includes(customClient.userId)) {
                    customClient.send(activityBroadcast);
                }
            });
            
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
        
        if (data.type === "typing") {
  if (!Customws.currentRoom) return;

  const findRoom = rooms.get(Customws.currentRoom);
  const typingEvent = JSON.stringify({
    type: "typing",
    username: Customws.username,
    isTyping: data.isTyping
  });

  findRoom?.forEach(client => {
    if (  client.readyState === WebSocket.OPEN) {
      client.send(typingEvent);
    }
  });
}

if (data.type === "dm") {
        const { toUserId, message } = data;

        if (!toUserId || !message?.trim()) {
            console.log("DM missing required fields:", { toUserId, message });
            return;
        }

        const target = userSockets.get(toUserId);
        console.log("Sending DM from", Customws.username, "to user", toUserId, "- target found:", !!target);

        // Get recipient username
        const recipient = await authModel.findById(toUserId).select("username");
        const sender = await authModel.findById(Customws.userId).select("username");

        const payloadToRecipient = {
          type: "dm",
          fromUserId: Customws.userId,
          fromUsername: Customws.username,
          toUserId,
          toUsername: recipient?.username,
          message,
          timestamp: new Date(),
        };

        const payloadToSender = {
          type: "dm",
          fromUserId: Customws.userId,
          fromUsername: Customws.username,
          toUserId,
          toUsername: recipient?.username,
          message,
          timestamp: new Date(),
        };

        // Send to recipient if online
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify(payloadToRecipient));
          console.log("DM sent to recipient");
        } else {
          console.log("Recipient not online or not found");
        }

        // Send confirmation back to sender
        Customws.send(JSON.stringify(payloadToSender));
        console.log("DM confirmation sent to sender");

        // Store DM in database using dmModel
        try {
          const dmModel = (await import("../models/dmModel.js")).default;
          const now = new Date();
          await dmModel.create({
            from: Customws.userId,
            to: toUserId,
            message: message,
            timestamp: now,
            read: false
          });
          console.log("DM saved to database");
          
          // Create activity for DM
          const activity = await activityModel.create({
              type: "dm_sent",
              title: `${Customws.username} sent a DM`,
              description: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
              userId: Customws.userId,
              username: Customws.username,
              metadata: {
                  recipientId: toUserId,
                  recipientUsername: recipient?.username
              },
              timestamp: new Date()
          });
          
          // Broadcast activity only to sender and recipient (privacy)
          const activityBroadcast = JSON.stringify({
              type: "activity",
              activity: {
                  id: activity._id,
                  type: activity.type,
                  title: activity.title,
                  description: activity.description,
                  userId: activity.userId,
                  username: activity.username,
                  timestamp: activity.timestamp
              }
          });
          
          users.forEach(client => {
              const customClient = client as customWebSocket;
              if (customClient.authenticated && 
                  customClient.readyState === WebSocket.OPEN && 
                  customClient.userId !== Customws.userId && // Don't send to self
                  customClient.userId === toUserId) {
                  customClient.send(activityBroadcast);
              }
          });
        } catch (error) {
          console.error("Error saving DM:", error);
        }

        return;
      }

if (data.type === "reaction") {
  if (!Customws.currentRoom) return;

  const { messageId, emoji } = data;

  await chatModel.findByIdAndUpdate(
    messageId,
    { $push: { reactions: { userId: Customws.userId, emoji } } },
    { new: true }
  );

  const findRoom = rooms.get(Customws.currentRoom);
  const reactionEvent = JSON.stringify({
    type: "reaction",
    messageId,
    userId: Customws.userId,
    username: Customws.username,
    emoji
  });

  findRoom?.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(reactionEvent);
    }
  });
}


            
        } catch (error) {
            console.log("error in connection function",error);
            
        }
    })


    
    
    ws.on("close", async ()=>{
    userCount--;
    users = users.filter( x=> x != ws)
    
    // Clear ping interval if exists
    if (Customws.pingInterval) {
        clearInterval(Customws.pingInterval);
    }
    
    // Update user status to offline when disconnected
    if (Customws.userId) {
        await authModel.findByIdAndUpdate(
            Customws.userId,
            { status: "offline" },
            { new: true }
        );
        userSockets.delete(Customws.userId);
    }
    
    // Update room online count if user was in a room
    if (Customws.currentRoom && rooms.has(Customws.currentRoom)) {
        const room = rooms.get(Customws.currentRoom);
        room?.delete(Customws);
        
        try {
            const roomModel = (await import("../models/roomModel.js")).default;
            const onlineCount = room?.size || 0;
            await roomModel.findOneAndUpdate(
                { name: Customws.currentRoom },
                { online: onlineCount },
                { new: true }
            );
            
            // Broadcast updated count to remaining room members
            const updateMsg = JSON.stringify({
                type: "room_update",
                room: Customws.currentRoom,
                online: onlineCount
            });
            room?.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(updateMsg);
                }
            });
        } catch (error) {
            console.error("Error updating room count on disconnect:", error);
        }
    }
    
    console.log("connection disconnected , TotalUsers :"+userCount);
})

    
})

