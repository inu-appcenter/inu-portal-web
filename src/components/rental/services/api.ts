import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Auth: "your-auth-token",
    },
});

export default api;
