import {model, Schema} from "mongoose";


const chatSchema = new Schema({
    room:{
        type:String,
        required:true
    },
    from:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
},{
    timestamps:true
})

const chatModel = model("message",chatSchema);
export default chatModel;