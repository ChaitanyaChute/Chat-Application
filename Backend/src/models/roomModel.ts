import { model, Schema } from "mongoose";

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "General"
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "users"
    }],
    online: {
        type: Number,
        default: 0
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const roomModel = model("rooms", roomSchema);
export default roomModel;
