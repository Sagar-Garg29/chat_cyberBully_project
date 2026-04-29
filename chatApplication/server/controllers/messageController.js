import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/user.js";
import {io, userSocketMap} from "../server.js"
import { filterCyberbullyText } from "../lib/cyberbullyFilter.js";


//Get all users except for logged in user
export const getUserForSidebar = async (req,res)=>{
   try {
    const userId = req.user._id;
    const filterUsers = await User.find({_id: {$ne:userId}}).select("-password")

    //total number of messages not seen
      const unseenMessages = {}
      const promises = filterUsers.map( async (user)=>{
        const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false}) //all the unseen messages here
        if(messages.length > 0){
            unseenMessages[user._id] = messages.length;
        }
      })
      await Promise.all(promises);
      res.json({success: true, users: filterUsers, unseenMessages})
   } catch (error) {
       console.log(error.messages);
       res.json({success: false, messages:error.message});
   }
}// with this function we get the number of user and number of unread messages


//Get all messages for selected users
export const getMessages = async (req, res) =>{
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
     
        await Message.updateMany({senderId: selectedUserId, receiverId: myId},{seen: true})

        res.json({success: true, messages})

    } catch (error) {
        console.log(error.messages);
       res.json({success: false, messages:error.message});
    }
}

//api to mark message as seen using message id
export const markMessageAsSeen = async (req, res)=>{
   try {
      const {id } = req.params;
      await Message.findByIdAndUpdate(id, {seen: true})

      res.json({success:true})

   } catch (error) {
     console.log(error.messages);
       res.json({success: false, messages:error.message});
   }
}

// Send a new message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text,image } = req.body;           // The message text from frontend
    const receiverId  = req.params.id;  // The selected user ID (from URL)
    const senderId = req.user._id;          // Logged-in user's ID

    let imageUrl;
    if(image){
         const uploadResponse = await cloudinary.uploader.upload(image)
         imageUrl = uploadResponse.secure_url;
    }

    // Validate
    if ((!text || text.trim() === "")&& !image) {
      return res.json({ success: false, message: "Message content cannot be empty" });
    }

    // Run text through cyberbully detector and mask bad words if needed.
    const sanitizedText = text ? await filterCyberbullyText(text) : text;

    // Create message in DB
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: sanitizedText,
      image: imageUrl,
      seen: false,
    });

    //Emit the new message to reciever socket
    const recieverSocketId = userSocketMap[receiverId];
    if(recieverSocketId){
        io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
