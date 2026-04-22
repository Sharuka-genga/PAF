export type Role = 'USER' | 'ADMIN' | 'TECHNICIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  provider?: string;
  emailAlerts?: boolean;
  ticketAlerts?: boolean;
  bookingAlerts?: boolean;
  compactMode?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  purpose: string;
  resourceName?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'BOOKING_APPROVED' | 'BOOKING_REJECTED' | 'BOOKING_CANCELLED' | 'TICKET_STATUS_CHANGED' | 'TICKET_ASSIGNED' | 'TICKET_COMMENT' | 'GENERAL' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface UserPreferences {
  userId: string;
  emailAlerts: boolean;
  ticketAlerts: boolean;
  bookingAlerts: boolean;
  compactMode: boolean;
}
