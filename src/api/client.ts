import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080",
  withCredentials: false,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const BookingAPI = {
  async create(payload: any) {
    // return (await api.post("/bookings", payload)).data;
    return { id: "mock", ...payload };
  },
  async list(params?: any) {
    // return (await api.get("/bookings", { params })).data;
    return [];
  },
};

export const TimeBlocksAPI = {
  async list(params?: { staffIds?: string[]; from?: string; to?: string }) {
    // return (await api.get("/time-blocks", { params })).data;
    return [];
  },
};