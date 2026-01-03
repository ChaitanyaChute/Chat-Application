import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  type: "room_created" | "user_signup" | "user_joined" | "message_sent" | "dm_sent";
  title: string;
  description: string;
  userId?: string;
  username?: string;
  roomId?: string;
  roomName?: string;
  metadata?: any;
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>({
  type: {
    type: String,
    enum: ["room_created", "user_signup", "user_joined", "message_sent", "dm_sent"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
  },
  username: {
    type: String,
  },
  roomId: {
    type: String,
  },
  roomName: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

activitySchema.index({ timestamp: -1 });

export default mongoose.model<IActivity>("Activity", activitySchema);
