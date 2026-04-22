import axios from "axios";
import type { Booking } from "./types";

// Standardizing API requests
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to add auth token and dynamic User ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          config.headers["X-User-Id"] = user.id;
        }
      } catch (e) {
        console.error("Failed to parse user from storage", e);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export const bookingService = {
  create: (data: Partial<Booking>) => api.post("/bookings", data),
  getMyBookings: () => api.get("/bookings/my"),
  getAllBookings: (status?: string) => api.get("/bookings", { params: { status } }),
  approve: (id: number) => api.put(`/bookings/${id}/approve`),
  reject: (id: number, reason: string) => api.put(`/bookings/${id}/reject`, { reason }),
  cancel: (id: number) => api.put(`/bookings/${id}/cancel`),
  delete: (id: number) => api.delete(`/bookings/${id}`)
};

export default api;
