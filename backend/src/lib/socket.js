import {Server} from "socket.io"; 
import http from "http"; //built in module in node.js
import express from "express";

const app = express();
const server = http.createServer(app); //create server and pass the into it

const io = new Server(server,{
    cors: {
       origin: ["http://localhost:5173"]
    }
})

//this function return socketid when we pass userid
export function getRecieverSocketId(userId){
    return userSocketMap[userId];
}

//used to store online users
const userSocketMap = {};  //format:{userId: socketId} userId come from db and socketId from below socket.id

io.on("connection",(Socket)=>{
    console.log("a user connected",Socket.id);

    const userId=Socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = Socket.id;

        //io.emit() is used to send events to all the connected clients
        io.emit("getOnlineUsers",Object.keys(userSocketMap));

    Socket.on("disconnect",()=>{
        console.log("A user disconnected",Socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
        
    });
});

export {io, app, server};

