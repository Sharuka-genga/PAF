export type Role = 'USER' | 'ADMIN' | 'TECHNICIAN';

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

export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'SPORTS_FACILITY' | 'LIBRARY' | 'OTHER';
export type ResourceStatus = 'AVAILABLE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface AvailabilityWindow {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType | string;
  location: string;
  description: string;
  available: boolean;
  capacity?: number;
  status?: ResourceStatus | string;
  imageUrl?: string;
  availabilityWindows?: AvailabilityWindow[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: number;
  userId: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CONFIRMED';
  rejectionReason?: string;
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
