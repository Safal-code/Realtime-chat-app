import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
  //these are the states
  messages: [],
  users: [],
  selectedUser: null, //to see right side welcome to talksy
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data }); //res.data get data from server after making request to it
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    //give userId to know which chat u trying to fetch
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  //Store fun() to send the messages
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] }); //keep prev mssg we have
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages:()=>{
    const {selectedUser} = get();
    if(!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage",(newMessage) =>{
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if(!isMessageSentFromSelectedUser) return; //help fix bug that someone send mssg if u do to another
      
      set({
        messages:[...get().messages,newMessage], //keep the prev mssg in history
      });
    });
  },

  //don't listen to messages when logout or close tab
  
  unsubscribeFromMessages:() =>{
    const socket= useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  //whenever u select user, that user's state is selected
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
