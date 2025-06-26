import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "dark",  //default theme is dark and name is chat-theme using localStorage thats why localstorage written
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme); //first set local storage with theme and update the state then set the theme in below line
    set({ theme });
  },
}));