import { model, Schema } from "mongoose";


const authSchema = new Schema({
    username :{
        type:String,
        unique:true,
        required : true
    },
    password:{
        type:String,
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now
    }

})


const authModel = model("users",authSchema);
export default authModel;