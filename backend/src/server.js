import express from "express";
import dotenv from "dotenv"; 
import cookieParser from "cookie-parser"

import path from "path"; //built-in in node for deployment

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import cors from "cors"; //for frontend state mngmnt


import { connectDB } from "./lib/db.js";
import { app,server } from "./lib/socket.js";

dotenv.config();//setup .env to get port

//const app=express(); // delete it as it is created in socket.js file
const PORT=process.env.PORT//PORT COMING FROM.env
const __dirname = path.resolve();

// app.get("/api/auth/signup",(req,res)=>{
//     res.send("signup ");
// });

// app.get("/api/auth/login",(req,res)=>{  Noob way to do it as it get messy
//     res.send("hello world login");       with so many routes
// });

// app.get("/api/auth/logout",(req,res)=>{
//     res.send("hellollogout");
// });

app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
})
);

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}


server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
    connectDB();
});