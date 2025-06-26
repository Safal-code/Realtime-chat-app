import express from "express";
import { checkAuth,updateProfile, login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router=express.Router()

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)

router.put("/update-profile", protectRoute, updateProfile) //this route is protected as user need to be logged in before accessing it protectRoute is middleware

//this route is if page is refreshed to check if user is authenticated
router.get("/check",protectRoute,checkAuth)   //if user not authenticated checkAuth not be called because of middleware

export default router;