export interface Ticket {
  id?: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  contactDetails: string;
  image1?: string;
  image2?: string;
  image3?: string;
  createdByUserId: string;
  assignedToUserId?: string;
  resolutionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketComment {
  id?: number;
  ticketId: number;
  userId: string;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  location: string;
  contactDetails: string;
  image1?: string;
  image2?: string;
  image3?: string;
  createdByUserId: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'ELECTRICAL' | 'PLUMBING' | 'IT' | 'HVAC' | 'FURNITURE' | 'OTHER';