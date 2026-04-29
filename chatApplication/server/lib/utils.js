import jwt from "jsonwebtoken";

// generate normal auth token
export const generateToken = (userId) => {
 const token = jwt.sign({userId}, process.env.JWT_SECRET);
 return token;
};


