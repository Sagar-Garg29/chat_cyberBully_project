import mongoose from "mongoose";

//function connect to the mongoDB database
export const connectDB = async ()=>{
    try {
        
        mongoose.connection.on('connected',()=>console.log("Database connected"));  //event listner
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    } catch (error) {
        console.log(error);
    }
}