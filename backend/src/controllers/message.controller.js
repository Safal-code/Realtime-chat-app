import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId,io } from "../lib/socket.js";

//get user on sidebar except logged-in user
export async function getUsersForSidebar(req,res) {
    try{
        const loggedInUserId=req.user._id;             //this route is protected so we can grab user by id from its request
        const filteredUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password"); //find all user except current logged in user and fetch everything except password

        res.status(200).json(filteredUsers);
    }catch(error){
        console.error("Error in getUserForSidebar:",error.message);
        res.status(500).json({error:"Internal server error"});
    }
};

//find message between u and other user
export async function getMessages(req,res) {
    try{
        const{id:userToChatId}=req.params  //req.param get dynamic value in url like id
        const myId = req.user._id;

        //we would also like to find all messages between both of us
        const messages = await Message.find({                 //find all messages where i am sender or the other user is sender
            $or:[                                                //filter 
                {senderId:myId,recieverId:userToChatId},
                {senderId:userToChatId,recieverId:myId}
            ]
        })

        res.status(200).json(messages);
    }catch(error){
        console.log("Error in getMessages controller:",error);
        res.status(500).json({error:"Internal server error"});
    }
};

//send a message could be text or image
export async function sendMessage(req,res){
    try{
        const{text,image}=req.body;
        const{id:recieverId}=req.params;
        const senderId=req.user._id;      //senderId is me

        //in case user sends img in mssg
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url; 
        }

        const newMessage = new Message({
            senderId,                          //it is us
            recieverId,
            text,
            image:imageUrl,
        });

        await newMessage.save();

        //REALTIME FUNCTIONALITY USING SOCKET.IO
        const recieverSocketId = getRecieverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage); //.to ensure mssg only go to reciever not broadcasted to everyone
            
        }

        res.status(201).json(newMessage);

    }catch(error){
        console.log("Error in sendMessage controller:",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}