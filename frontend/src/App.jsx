import Navbar from "./components/Navbar";

import{Routes,Route, Navigate} from "react-router-dom";

import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { useAuthStore } from './store/useAuthStore';
import {Loader} from "lucide-react"
import {Toaster} from "react-hot-toast";
import  { useEffect } from 'react'
import { useThemeStore } from './store/useThemeStore';

function App() {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore();
  const {theme} = useThemeStore(); //state that changes theme from setting page

  console.log(onlineUsers);

  useEffect(()=>{
    checkAuth();
  }, [checkAuth]);

  //Making loader of the page
  if(isCheckingAuth && !authUser) return(
     
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"/>
    </div>
  )
  return (
    // implement theme change state
    <div data-theme={theme}>    
      <Navbar/>
     {/* <Toaster position="top-center" reverseOrder={false} /> */}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />  
        <Route path="/signup" element={!authUser ?<SignUpPage />:<Navigate to="/"  />} />
        <Route path="/login" element={!authUser ?<LoginPage />:<Navigate to="/"  />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser? <ProfilePage />:<Navigate to="/login"  />} /> 
        
      </Routes>
      <Toaster />
    </div>
  )
} //user if not logget should be able see homepage profile etc if user logged in should be able see signup page

export default App