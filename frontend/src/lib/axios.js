import axios from "axios";

export const axiosInstance=axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" :"api",
    withCredentials:true,  //doing this allows to send cookie in every single request

});