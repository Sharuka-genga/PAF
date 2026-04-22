import type { Ticket, TicketComment, TicketRequest } from '../types/ticket';

const API_URL = 'http://localhost:8080/api/tickets';

export const ticketService = {
  // Get all tickets
  getAllTickets: async (): Promise<Ticket[]> => {
    const response = await fetch(API_URL);
    return response.json();
  },

  // Get ticket by id
  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/${id}`);
    return response.json();
  },

  // Get tickets by user
  getTicketsByUser: async (userId: number): Promise<Ticket[]> => {
    const response = await fetch(`${API_URL}/user/${userId}`);
    return response.json();
  },

  // Get tickets by status
  getTicketsByStatus: async (status: string): Promise<Ticket[]> => {
    const response = await fetch(`${API_URL}/status/${status}`);
    return response.json();
  },

  // Create ticket
  createTicket: async (ticket: TicketRequest): Promise<Ticket> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    return response.json();
  },

  // Update ticket status
  updateTicketStatus: async (id: number, status: string, resolutionNotes?: string): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNotes }),
    });
    return response.json();
  },

  // Assign technician
  assignTechnician: async (ticketId: number, technicianId: number): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/${ticketId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ technicianId }),
    });
    return response.json();
  },

  // Delete ticket
  deleteTicket: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  },

  // Add comment
  addComment: async (comment: { ticketId: number; userId: number; comment: string }): Promise<TicketComment> => {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    return response.json();
  },

  // Get comments by ticket
  getCommentsByTicket: async (ticketId: number): Promise<TicketComment[]> => {
    const response = await fetch(`${API_URL}/${ticketId}/comments`);
    return response.json();
  },

  // Update comment
  updateComment: async (commentId: number, userId: number, comment: string): Promise<TicketComment> => {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, comment }),
    });
    return response.json();
  },

  // Delete comment
  deleteComment: async (commentId: number, userId: number): Promise<void> => {
    await fetch(`${API_URL}/comments/${commentId}?userId=${userId}`, { method: 'DELETE' });
  },
};