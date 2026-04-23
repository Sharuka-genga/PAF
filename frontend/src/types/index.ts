export type Role = 'USER' | 'ADMIN' | 'TECHNICIAN';

export type ResourceType =
  | 'LECTURE_HALL'
  | 'LAB'
  | 'MEETING_ROOM'
  | 'PROJECTOR'
  | 'CAMERA'
  | 'OTHER';

export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface AvailabilityWindow {
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  provider?: string;
  profilePicture?: string;
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
  profilePicture?: string;
  roles: Role[];
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number | null;
  location: string;
  status: ResourceStatus;
  description: string | null;
  imageUrl?: string | null;
  availabilityWindows: AvailabilityWindow[];
  createdAt: string;
  updatedAt: string;
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
