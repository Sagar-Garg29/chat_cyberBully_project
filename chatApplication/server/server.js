import express from "express";   // to  create the server
import "dotenv/config";         //we can use the environment variable
import cors from "cors";        //allow backend with any frontend url
import http from "http";       //http method
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//create Express app and Http server 
const app = express();
const server = http.createServer(app);

//Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

//Store data of online users
export const userSocketMap = {}; //{userId, socketId}

//socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId){
        userSocketMap[userId] = socket.id;
    }

    //Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    //discoonect event
    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

//middleware setup
app.use(express.json({limit:"4mb"}))   //limit:4mb->upload any image under 4mb
app.use(cors());     //it will alow all the url with backend

//Router setup
app.use("/api/status" , (req,res)=> res.send("Server is Live"))  //api endpoint ->it will    check backend server is running or not
app.use("/api/auth", userRouter);     //user's endpoint
app.use("/api/messages", messageRouter);  //user's message endpoint

//connect to mongoDB
await connectDB();


if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 3000;   //if port number is available in environmental variable it used oterwise port number 3000 is used;
    server.listen(PORT, ()=>console.log("Server is running on PORT: " +PORT))
}


//export server for deploy on vercel
export default server;