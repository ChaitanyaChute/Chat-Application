import { Router } from "express";
import activityModel from "../models/activityModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Get recent activities
router.get("/recent", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    // Get user's room memberships
    const roomModel = (await import("../models/roomModel.js")).default;
    const userRooms = await roomModel.find({ members: userId }).select("_id name");
    const userRoomIds = userRooms.map(room => room._id.toString());
    const userRoomNames = userRooms.map(room => room.name);
    
    // Filter activities: include only those relevant to the user (excluding their own)
    const activities = await activityModel
      .find({
        $and: [
          {
            $or: [
              { type: "user_signup" }, // Public signups
              { type: "room_created" }, // Public room creations
              { roomId: { $in: userRoomIds } }, // Activities in user's rooms
              { roomName: { $in: userRoomNames } }, // Activities in user's rooms (by name)
              { "metadata.recipientId": userId } // DMs sent to this user
            ]
          },
          { userId: { $ne: userId } } // Exclude user's own activities
        ]
      })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
});

export default router;
