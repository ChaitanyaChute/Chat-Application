import express, { type Request, type Response } from "express";
import chatModel from "../models/chatModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { broadcastNewMessage } from "../libs/broadcast.js";

const messageRoute = express.Router();

// Get all messages for a room (protected)
messageRoute.get("/room/:roomName", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { roomName } = req.params;

        const messages = await chatModel
            .find({ room: roomName })
            .sort({ createdAt: 1 })
            .limit(100);

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching messages",
            error
        });
    }
});

// Get recent messages (protected)
messageRoute.get("/recent/:limit", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { limit } = req.params;
        const limitNum = parseInt(limit || "10") || 10;

        const messages = await chatModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limitNum);

        res.status(200).json({
            success: true,
            messages: messages.reverse()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching recent messages",
            error
        });
    }
});

// Send a message to a room (protected)
messageRoute.post("/send", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { room, from, message } = req.body;

        if (!room || !from || !message) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newMessage = await chatModel.create({
            room,
            from,
            message
        });

        // Broadcast new message notification
        await broadcastNewMessage({
            room,
            from,
            message,
            timestamp: (newMessage as any).createdAt || new Date()
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error sending message",
            error
        });
    }
});

// Delete a message (protected)
messageRoute.delete("/:messageId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;

        const deletedMessage = await chatModel.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Message deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting message",
            error
        });
    }
});

export default messageRoute;