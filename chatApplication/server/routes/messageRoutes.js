import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {  getMessages, getUserForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

//protected routes
messageRouter.get("/users" ,protectRoute, getUserForSidebar);
messageRouter.get("/:id" ,protectRoute, getMessages);
messageRouter.post("/send/:id",protectRoute, sendMessage);
messageRouter.put("/mark/:id" ,protectRoute, markMessageAsSeen);

export default messageRouter;