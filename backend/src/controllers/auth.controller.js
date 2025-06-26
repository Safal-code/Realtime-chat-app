import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";

export async function signup(req,res){
    const {email,password,fullName} =req.body;
    try{
        if(!email||!password||!fullName){
            return res.status(400).json({message:"All fields are required"});
        }

        if(password.length<6){
            return res.status(400).json({message:"Password must be atleast 6 characters"})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;//regular expression to check if email has valid syntax
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }  
        const existingUser=await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({message:"Email already exists,please use a different email"});
        }  
        
        const idx=Math.floor(Math.random()*100)+1; //generate a no. between 1 and 100
        //const randomAvatar=`https://avatar.iran.liara.run/public/${idx}.png`;
        const randomAvatar = "/avatar.png";

        const newUser= await User.create({
            email,
            fullName,
            password,
            profilePic:randomAvatar,
        })

        //create token for authentication
        const token=jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY,{ //jwtsign has 3 args payload to check later(userki id),secret key ,other options
            expiresIn:"7d"       
        })

        //added token in response
        res.cookie("jwt",token,{       //2 args name(could be anything), this is token like to send and some options
            maxAge:7*24*60*60*1000,   //milisec format of seven days
            httpOnly:true,  //prevent XSS attacks
            sameSite:"strict", //prevent csrf attacks
            secure:process.env.NODE_ENV==="production", //convert http to https if in production as currently its development
        });

        //send this response to user
        res.status(201).json({success:true, user:newUser}) //201 tells something created in db newUser is created

    }catch(error){
        console.log("Error in Signup controller",error);
        res.status(400).json({message:"Internal Server Error"});
    }
};

export async function login(req,res){
    try{
        const{email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({message:"All field are required"});
        }
          //Checking entered login credentials
        const user =await User.findOne({email});
        if(!user) return res.status(401).json({message:"Invalid email or password"});  //401 for unauthorized access
        
        const isPasswordCorrect=await user.matchPassword(password);
        if(!isPasswordCorrect) return res.status(401).json({message:"Invalid email or password"});

        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{ //jwtsign has 3 args payload to check later(userki id),secret key ,other options
            expiresIn:"7d"       
        })

        //added token in response
        res.cookie("jwt",token,{       //2 args name(could be anything), this is token like to send and some options
            maxAge:7*24*60*60*1000,   //milisec format of seven days
            httpOnly:true,  //prevent XSS attacks
            sameSite:"strict", //prevent csrf attacks
            secure:process.env.NODE_ENV==="production", //convert http to https if in production as currently its development
        });
        res.status(200).json({success:true,user});

    }catch(error){
        console.log("Error in login controller",error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
};

export function logout(req,res){ 
    res.clearCookie("jwt");     //Just clear the cookies
    res.status(200).json({success:true,message:"Logout successful"})
};

export async function updateProfile(req,res){
    try{
        const{profilePic}=req.body;
        const userId=req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile pic is required"});
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic); //Upload image in cloudinary
        const updateUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true}); //Update it in database too

        res.status(200).json(updateUser);

    }catch(error){
        console.log("error in update profile:",error);
        res.status(500).json({message:"Internal server error"});
    }
};

export async function checkAuth(req,res) {
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}