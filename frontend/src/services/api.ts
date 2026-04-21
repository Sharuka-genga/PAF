import axios from 'axios';
import type { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data: object): Promise<AxiosResponse> => api.post('/auth/login', data),
  register: (data: object): Promise<AxiosResponse> => api.post('/auth/register', data),
  getMe: (): Promise<AxiosResponse> => api.get('/auth/me'),
  updateMe: (data: object): Promise<AxiosResponse> => api.put('/auth/me', data),
  changePassword: (data: object): Promise<AxiosResponse> => api.patch('/auth/me/password', data),
  deleteMe: (): Promise<AxiosResponse> => api.delete('/auth/me'),
  getPreferences: (): Promise<AxiosResponse> => api.get('/auth/me/preferences'),
  updatePreferences: (data: object): Promise<AxiosResponse> => api.patch('/auth/me/preferences', data),
};

// Resource APIs
export const resourceAPI = {
  getAll: (): Promise<AxiosResponse> => api.get('/resources'),
  getById: (id: string): Promise<AxiosResponse> => api.get(`/resources/${id}`),
  search: (params: Record<string, string | number>): Promise<AxiosResponse> => api.get('/resources/search', { params }),
  create: (data: object): Promise<AxiosResponse> => api.post('/resources', data),
  update: (id: string, data: object): Promise<AxiosResponse> => api.put(`/resources/${id}`, data),
  delete: (id: string): Promise<AxiosResponse> => api.delete(`/resources/${id}`),
};

// Booking APIs
export const bookingAPI = {
  create: (data: object): Promise<AxiosResponse> => api.post('/bookings', data),
  getMyBookings: (): Promise<AxiosResponse> => api.get('/bookings/my'),
  getById: (id: string): Promise<AxiosResponse> => api.get(`/bookings/${id}`),
  getAll: (params?: object): Promise<AxiosResponse> => api.get('/bookings', { params }),
  review: (id: string, data: object): Promise<AxiosResponse> => api.put(`/bookings/${id}/review`, data),
  cancel: (id: string): Promise<AxiosResponse> => api.patch(`/bookings/${id}/cancel`),
  getByResource: (resourceId: string): Promise<AxiosResponse> => api.get(`/bookings/resource/${resourceId}`),
};

// Ticket APIs
export const ticketAPI = {
  create: (formData: FormData): Promise<AxiosResponse> => api.post('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyTickets: (): Promise<AxiosResponse> => api.get('/tickets/my'),
  getById: (id: string): Promise<AxiosResponse> => api.get(`/tickets/${id}`),
  getAll: (params?: object): Promise<AxiosResponse> => api.get('/tickets', { params }),
  updateStatus: (id: string, data: object): Promise<AxiosResponse> => api.put(`/tickets/${id}/status`, data),
  assignTechnician: (id: string, techId: string): Promise<AxiosResponse> => api.patch(`/tickets/${id}/assign/${techId}`),
  getAssigned: (): Promise<AxiosResponse> => api.get('/tickets/assigned'),
  delete: (id: string): Promise<AxiosResponse> => api.delete(`/tickets/${id}`),
};

// Comment APIs
export const commentAPI = {
  getByTicket: (ticketId: string): Promise<AxiosResponse> => api.get(`/tickets/${ticketId}/comments`),
  add: (ticketId: string, data: object): Promise<AxiosResponse> => api.post(`/tickets/${ticketId}/comments`, data),
  update: (ticketId: string, commentId: string, data: object): Promise<AxiosResponse> => api.put(`/tickets/${ticketId}/comments/${commentId}`, data),
  delete: (ticketId: string, commentId: string): Promise<AxiosResponse> => api.delete(`/tickets/${ticketId}/comments/${commentId}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: (): Promise<AxiosResponse> => api.get('/notifications'),
  getUnread: (): Promise<AxiosResponse> => api.get('/notifications/unread'),
  getUnreadCount: (): Promise<AxiosResponse> => api.get('/notifications/unread/count'),
  markAsRead: (id: string): Promise<AxiosResponse> => api.patch(`/notifications/${id}/read`),
  markAllAsRead: (): Promise<AxiosResponse> => api.patch('/notifications/read-all'),
  delete: (id: string): Promise<AxiosResponse> => api.delete(`/notifications/${id}`),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: (): Promise<AxiosResponse> => api.get('/admin/users'),
  getUsersByRole: (role: string): Promise<AxiosResponse> => api.get(`/admin/users/role/${role}`),
  updateUserRoles: (userId: string, roles: string[]): Promise<AxiosResponse> => api.put(`/admin/users/${userId}/roles`, roles),
  deleteUser: (userId: string): Promise<AxiosResponse> => api.delete(`/admin/users/${userId}`),
};

// Chat APIs
export const chatAPI = {
  sendMessage: (message: string): Promise<AxiosResponse> => api.post('/chat', { message }),
  createBooking: (data: object): Promise<AxiosResponse> => api.post('/chat/book', data),
  createTicket: (data: object): Promise<AxiosResponse> => api.post('/chat/ticket', data),
};

export default api;
