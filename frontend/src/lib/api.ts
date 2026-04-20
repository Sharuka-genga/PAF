import axios from "axios";

// Standardizing API requests
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    "X-User-Id": "1"
  }
});

export const bookingService = {
  create: (data: any) => api.post("/bookings", data),
  getMyBookings: () => api.get("/bookings/my"),
  getAllBookings: (status?: string) => api.get("/bookings", { params: { status } }),
  approve: (id: number) => api.put(`/bookings/${id}/approve`),
  reject: (id: number, reason: string) => api.put(`/bookings/${id}/reject`, { reason }),
  cancel: (id: number) => api.put(`/bookings/${id}/cancel`),
  delete: (id: number) => api.delete(`/bookings/${id}`)
};

export default api;
