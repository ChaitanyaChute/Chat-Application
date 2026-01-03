import { model, Schema, Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email?: string;
  password: string;
  bio?: string;
  status?: "online" | "idle" | "offline";
  avatar?: string;
  created_at: Date;
}

const authSchema = new Schema<IUser>({
    username :{
        type:String,
        unique:true,
        required : true
    },
    email: {
        type: String,
        required: false
    },
    password:{
        type:String,
        required:true
    },
    bio: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["online", "idle", "offline"],
        default: "offline"
    },
    avatar: {
        type: String,
        default: null
    },
    created_at:{
        type:Date,
        default:Date.now
    }
});

export default model<IUser>("users", authSchema);