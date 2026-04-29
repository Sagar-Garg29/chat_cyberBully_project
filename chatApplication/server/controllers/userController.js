// controller function create the user ,allow the user to login ,authenticate the user,upgrade the user profile 

import cloudinary from "../lib/cloudinary.js";
import { generateToken} from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

//Signup a new User
export const signup = async (req, res)=>{
    const {fullName,email,password} = req.body;

    try {
        if(!fullName || !email || !password ){
            return res.json({success: false, message:"Missing Details"});
        }
        const user = await User.findOne({email});

        if(user){
             return res.json({success: false, message:"Account Already Exist"});
        }

        //if there is no user then generate the encrypted password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //new user
        const newUser = await User.create({
            fullName, email , password: hashedPassword
        });

        //create a token to authenticate the user
        const token = generateToken(newUser._id)

        res.json({success: true, userData: newUser, token, message:"Account Created Successfully"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//Controller to login a user
export const login = async (req, res) =>{
    try {
        const { email,password} = req.body;
        const userData = await User.findOne({email})
         if (!userData) {
           return res.json({ success: false, message: "User not found" });
          }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        //if password is not correct
        if(!isPasswordCorrect){
            return res.json({success: false, message: "Invalid Credentials"});
        }

        //if password is correct
        const token = generateToken(userData._id)
        res.json({success: true, userData: userData, token, message:"Login Successful"})

    } catch (error) {
         console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//Controller to check if user is authenticated
export const checkAuth = (req,res)=>{
    res.json({success:true, user: req.user});
}

//Controller to update user profile details
export const updateProfile = async (req,res)=>{
    try {
        const {profilePic,bio,fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
           updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
        }
        else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url,bio, fullName}, {new:true})
        }
        res.json({success: true, user: updatedUser})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message:error.message})
    }
}