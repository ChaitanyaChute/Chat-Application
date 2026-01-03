import { Router } from "express";
import authModel from "../models/authModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Get all users for DM search
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = (req as any).user.id;

    let searchQuery: any = {
      _id: { $ne: currentUserId }, // Exclude current user
    };

    if (query && typeof query === "string") {
      searchQuery.$or = [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    const users = await authModel
      .find(searchQuery)
      .select("username email status avatar bio")
      .limit(50);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users",
    });
  }
});

// Get user by ID
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await authModel
      .findById(userId)
      .select("username email status avatar bio");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

export default router;
