import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  AuthResponse, 
  User, 
  Booking, 
  Ticket, 
  Notification, 
  UserPreferences,
  Role,
  Ticket,
  Resource
} from '../types';
import type { Booking } from '../lib/types';
import type { Resource, ResourceRequest, ResourceStatus } from '../types/resource';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
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
  login: (data: any) => api.post<ApiResponse<AuthResponse>>('/auth/login', data),
  register: (data: any) => api.post<ApiResponse<AuthResponse>>('/auth/register', data),
  getMe: () => api.get<ApiResponse<User>>('/auth/me'),
  updateMe: (data: any) => api.put<ApiResponse<User>>('/auth/me', data),
  changePassword: (data: any) => api.patch<ApiResponse<void>>('/auth/me/password', data),
  deleteMe: () => api.delete<ApiResponse<void>>('/auth/me'),
  getPreferences: () => api.get<ApiResponse<UserPreferences>>('/auth/me/preferences'),
  updatePreferences: (data: any) => api.patch<ApiResponse<UserPreferences>>('/auth/me/preferences', data),
  uploadProfileImage: (formData: FormData) => api.post<ApiResponse<User>>('/auth/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeProfileImage: () => api.delete<ApiResponse<User>>('/auth/me/profile-image'),
};

// Resource APIs
export const resourceAPI = {
  getAll: () => api.get<ApiResponse<Resource[]>>('/resources'),
  getById: (id: string) => api.get<ApiResponse<Resource>>(`/resources/${id}`),
  search: (params: any) => api.get<ApiResponse<Resource[]>>('/resources/search', { params }),
  create: (data: any) => api.post<ApiResponse<Resource>>('/resources', data),
  update: (id: string, data: any) => api.put<ApiResponse<Resource>>(`/resources/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/resources/${id}`),
  uploadImage: (id: string, formData: FormData) => api.post<ApiResponse<Resource>>(`/resources/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (id: string) => api.delete<ApiResponse<void>>(`/resources/${id}/image`),
  patchStatus: (id: string, status: string) => api.patch<ApiResponse<Resource>>(`/resources/${id}/status`, { status }),
};

// Booking APIs
export const bookingAPI = {
  create: (data: any) => api.post<ApiResponse<Booking>>('/bookings', data),
  getMyBookings: () => api.get<ApiResponse<Booking[]>>('/bookings/my'),
  getById: (id: string) => api.get<ApiResponse<Booking>>(`/bookings/${id}`),
  getAll: (params: any) => api.get<ApiResponse<Booking[]>>('/bookings', { params }),
  review: (id: string, data: any) => api.put<ApiResponse<Booking>>(`/bookings/${id}/review`, data),
  cancel: (id: string) => api.patch<ApiResponse<void>>(`/bookings/${id}/cancel`),
  getByResource: (resourceId: string) => api.get<ApiResponse<Booking[]>>(`/bookings/resource/${resourceId}`),
};

// Ticket APIs
export const ticketAPI = {
  create: (formData: FormData) => api.post<ApiResponse<Ticket>>('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyTickets: () => api.get<ApiResponse<Ticket[]>>('/tickets/my'),
  getById: (id: string) => api.get<ApiResponse<Ticket>>(`/tickets/${id}`),
  getAll: (params?: any) => api.get<ApiResponse<Ticket[]>>('/tickets', { params }),
  updateStatus: (id: string, data: any) => api.put<ApiResponse<Ticket>>(`/tickets/${id}/status`, data),
  assignTechnician: (id: string, techId: string) => api.patch<ApiResponse<Ticket>>(`/tickets/${id}/assign/${techId}`),
  getAssigned: () => api.get<ApiResponse<Ticket[]>>('/tickets/assigned'),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/tickets/${id}`),
};

// Comment APIs
export const commentAPI = {
  getByTicket: (ticketId: string) => api.get<ApiResponse<any[]>>(`/tickets/${ticketId}/comments`),
  add: (ticketId: string, data: any) => api.post<ApiResponse<any>>(`/tickets/${ticketId}/comments`, data),
  update: (ticketId: string, commentId: string, data: any) => api.put<ApiResponse<any>>(`/tickets/${ticketId}/comments/${commentId}`, data),
  delete: (ticketId: string, commentId: string) => api.delete<ApiResponse<void>>(`/tickets/${ticketId}/comments/${commentId}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get<ApiResponse<Notification[]>>('/notifications'),
  getUnread: () => api.get<ApiResponse<Notification[]>>('/notifications/unread'),
  getUnreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread/count'),
  markAsRead: (id: string) => api.patch<ApiResponse<void>>(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch<ApiResponse<void>>('/notifications/read-all'),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/notifications/${id}`),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get<ApiResponse<User[]>>('/admin/users'),
  getUsersByRole: (role: Role) => api.get<ApiResponse<User[]>>(`/admin/users/role/${role}`),
  updateUser: (userId: string, data: any) => api.put<ApiResponse<User>>(`/admin/users/${userId}`, data),
  updateUserRoles: (userId: string, roles: Role[]) => api.put<ApiResponse<User>>(`/admin/users/${userId}/roles`, roles),
  deleteUser: (userId: string) => api.delete<ApiResponse<void>>(`/admin/users/${userId}`),
};

// Chat APIs
export const chatAPI = {
  sendMessage: (message: string) => api.post<ApiResponse<any>>('/chat', { message }),
  createBooking: (data: any) => api.post<ApiResponse<any>>('/chat/book', data),
  createTicket: (data: any) => api.post<ApiResponse<any>>('/chat/ticket', data),
};

export default api;
