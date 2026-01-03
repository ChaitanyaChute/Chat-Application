import { model, Schema } from "mongoose";

const dmSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const dmModel = model("dms", dmSchema);
export default dmModel;
