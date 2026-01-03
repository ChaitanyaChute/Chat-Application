import express, { type Request, type Response } from "express";
import dmModel from "../models/dmModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { broadcastNewMessage } from "../libs/broadcast.js";

const dmRoute = express.Router();

// Get DM list for a user (protected)
dmRoute.get("/list/:userId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Get all DMs where user is either sender or receiver
        const dms = await dmModel
            .find({
                $or: [{ from: userId }, { to: userId }]
            })
            .populate("from", "username bio status")
            .populate("to", "username bio status")
            .sort({ timestamp: -1 });

        // Get unique users (DM conversations)
        const uniqueUsers = new Set();
        const dmList: any[] = [];

        for (const dm of dms) {
            const fromUser = dm.from as any;
            const toUser = dm.to as any;
            const otherUser = fromUser._id?.toString() === userId ? toUser : fromUser;
            
            if (!uniqueUsers.has(otherUser._id?.toString())) {
                uniqueUsers.add(otherUser._id?.toString());
                dmList.push({
                    id: otherUser._id,
                    name: otherUser.username,
                    type: "dm",
                    description: dm.message?.slice(0, 50) || otherUser.bio || "Direct Message",
                    status: otherUser.status || "offline",
                    lastMessageAt: dm.timestamp
                });
            }
        }

        res.status(200).json({
            success: true,
            dms: dmList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching DM list",
            error
        });
    }
});

// Get DM history between two users (protected)
dmRoute.get("/history/:userId/:otherUserId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId, otherUserId } = req.params;

        const messages = await dmModel
            .find({
                $or: [
                    { from: userId, to: otherUserId },
                    { from: otherUserId, to: userId }
                ]
            })
            .populate("from", "username")
            .populate("to", "username")
            .sort({ timestamp: 1 });

        res.status(200).json({
            success: true,
            messages,
            history: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching DM history",
            error
        });
    }
});

// Send a DM (protected)
dmRoute.post("/send", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { from, to, message } = req.body;

        if (!from || !to || !message) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newDm = await dmModel.create({
            from,
            to,
            message,
            timestamp: new Date()
        });

        await newDm.populate("from", "username");
        await newDm.populate("to", "username");

        // Broadcast DM notification
        await broadcastNewMessage({
            type: 'dm',
            from,
            to,
            message,
            timestamp: newDm.timestamp
        });

        res.status(201).json({
            success: true,
            message: "DM sent successfully",
            dm: newDm
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error sending DM",
            error
        });
    }
});

// Mark DM as read (protected)
dmRoute.put("/:dmId/read", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { dmId } = req.params;

        const dm = await dmModel.findByIdAndUpdate(
            dmId,
            { read: true },
            { new: true }
        );

        res.status(200).json({
            success: true,
            dm
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error marking DM as read",
            error
        });
    }
});

export default dmRoute;