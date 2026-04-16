import axios from "axios";

// Standardizing API requests
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    // Mock user ID for now as requested by the assignment logic
    "X-User-Id": "1" 
  }
});

export const bookingService = {
  create: (data: any) => api.post("/bookings", data),
  getMyBookings: () => api.get("/bookings/my"),
  getAllBookings: () => api.get("/bookings"),
  approve: (id: number) => api.put(`/bookings/${id}/approve`),
  reject: (id: number, reason: string) => api.put(`/bookings/${id}/reject`, { reason }),
  cancel: (id: number) => api.put(`/bookings/${id}/cancel`)
};

export default api;
