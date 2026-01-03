import express, { type Request, type Response } from "express";
import roomModel from "../models/roomModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import activityModel from "../models/activityModel.js";
import authModel from "../models/authModel.js";
import { broadcastActivity } from "../libs/broadcast.js";
import mongoose from "mongoose";

const roomRouter = express.Router();

// Get all rooms (protected) - only rooms the user has joined
roomRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        
        const rooms = await roomModel
            .find({ members: userId })
            .populate("creator", "username")
            .select("-members")
            .sort({ lastMessageAt: -1 }); // Sort by most recent message

        res.status(200).json({
            success: true,
            rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching rooms",
            error
        });
    }
});

// Get all available rooms to browse (protected)
roomRouter.get("/browse", authMiddleware, async (req: Request, res: Response) => {
    try {
        const rooms = await roomModel
            .find()
            .populate("creator", "username")
            .select("-members");

        res.status(200).json({
            success: true,
            rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching rooms",
            error
        });
    }
});

// Create a new room (protected)
roomRouter.post("/create", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { name, description, category, creator } = req.body;

        if (!name || !description || !creator) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const existingRoom = await roomModel.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: "Room name already exists"
            });
        }

        const newRoom = await roomModel.create({
            name,
            description,
            category: category || "General",
            creator,
            members: [creator],
            online: 0
        });

        // Get creator username
        const creatorUser = await authModel.findById(creator);
        
        // Create activity for room creation
        const activity = await activityModel.create({
            type: "room_created",
            title: `New room: ${name}`,
            description: `@${creatorUser?.username || 'unknown'} created ${name}`,
            userId: creator,
            username: creatorUser?.username,
            roomId: newRoom._id,
            roomName: name,
        });

        // Broadcast to all connected users
        await broadcastActivity(activity);

        res.status(201).json({
            success: true,
            message: "Room created successfully",
            room: newRoom
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating room",
            error
        });
    }
});

// Get room by ID (protected)
roomRouter.get("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const room = await roomModel
            .findById(id)
            .populate("creator", "username")
            .populate("members", "username");

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        res.status(200).json({
            success: true,
            room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching room",
            error
        });
    }
});

// Join a room (protected)
roomRouter.post("/:id/join", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const room = await roomModel.findByIdAndUpdate(
            id,
            { $addToSet: { members: userId } },
            { new: true }
        ).populate("members", "username");

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        // Get user who joined
        const joiningUser = await authModel.findById(userId);
        
        // Create activity for user joining room
        const activity = await activityModel.create({
            type: "user_joined",
            title: `User joined ${room.name}`,
            description: `@${joiningUser?.username || 'unknown'} joined #${room.name}`,
            userId: userId,
            username: joiningUser?.username,
            roomId: room._id,
            roomName: room.name,
        });

        // Broadcast to all connected users
        await broadcastActivity(activity);

        res.status(200).json({
            success: true,
            message: "Joined room successfully",
            room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error joining room",
            error
        });
    }
});

// Leave a room (protected)
roomRouter.post("/:id/leave", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        console.log("Leave room request:", { roomId: id, userId });

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Find the room first to verify it exists
        const existingRoom = await roomModel.findById(id);
        if (!existingRoom) {
            console.log("Room not found:", id);
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        console.log("Room found, current members:", existingRoom.members);

        // Convert userId to ObjectId for proper matching
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Remove user from members array
        const room = await roomModel.findByIdAndUpdate(
            id,
            { $pull: { members: userObjectId } },
            { new: true }
        ).populate("members", "username");

        console.log("Room after update, members:", room?.members);

        res.status(200).json({
            success: true,
            message: "Left room successfully",
            room
        });
    } catch (error) {
        console.error("Error leaving room:", error);
        res.status(500).json({
            success: false,
            message: "Error leaving room",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Update room online count (protected)
roomRouter.put("/:id/online", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { online } = req.body;

        const room = await roomModel.findByIdAndUpdate(
            id,
            { online },
            { new: true }
        );

        res.status(200).json({
            success: true,
            room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating room",
            error
        });
    }
});

export default roomRouter;