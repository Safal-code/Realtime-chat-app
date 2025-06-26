import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function protectRoute(req,res,next){
    try{
        const token = req.cookies.jwt //get token from cookies of login  route and it name was jwt there so used jwt here
        if(!token){
            return res.status(401).json({message:"Unauthorized- No token provided"});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)    //give token and jwt secret so jwt verifies if its actual token or not

        if(!decoded){
            return res.status(401).json({message:"Unauthorized-Invalid Token"})
        }

        const user=await User.findById(decoded.userId).select("-password");  //select everything except password
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        req.user=user   //req.user is logged-in user info attached to request after verifying token

        next()

    }catch(error){
        console.log("Error in protectionRoute middleware:",error.message);
        return res.status(500).json({ message: "Internal Server Error in protectRoute" });
    }
}