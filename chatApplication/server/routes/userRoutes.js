import express from "express";
import { checkAuth,  login,signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const userRouter = express.Router();


//public routes
userRouter.post("/login",login);
userRouter.post("/signup",signup);

//protected routes
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check",protectRoute,checkAuth);

export default userRouter;
