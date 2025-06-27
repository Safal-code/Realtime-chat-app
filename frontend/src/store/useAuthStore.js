import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

//these are the states u define before using it
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true, //initially true if we refresh page we check if user authenticated or not
  onlineUsers: [],
  socket: null, //state for socket initially

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check"); //call axios fun() half url cause it already defined base in axios.js file
      set({ authUser: res.data }); //set the auth user state with res data
      get().connectSocket(); //make online user if page refreshed
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.user });
      toast.success("Account created successfully");

      get().connectSocket(); //connect to server after signup so we are online
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");

      get().connectSocket(); //just after login you'd like to connect to socket
      //to do remove it
      console.log("Logged in user:", res.data); // check if it has _id, email, etc.
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    //show the image being uploaded
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // function which was called above after login
  connectSocket: () => {
    const { authUser } = get(); //authUser from the get method
    if (!authUser || get().socket?.connected) return; //if user not authenticated or already connected then don't try new connection

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket }); //after connection update the socket state with socket variable

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect(); //if already connected then try to disconnect
  },
}));
