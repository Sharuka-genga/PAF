// import type { Ticket, TicketComment, TicketRequest } from '../types/ticket';

// const API_URL = 'http://localhost:8080/api/tickets';

// export const ticketService = {
//   // Get all tickets
//   getAllTickets: async (): Promise<Ticket[]> => {
//     const response = await fetch(API_URL);
//     return response.json();
//   },

//   // Get ticket by id
//   getTicketById: async (id: number): Promise<Ticket> => {
//     const response = await fetch(`${API_URL}/${id}`);
//     return response.json();
//   },

//   // Get tickets by user
//   getTicketsByUser: async (userId: number): Promise<Ticket[]> => {
//     const response = await fetch(`${API_URL}/user/${userId}`);
//     return response.json();
//   },

//   // Get tickets by status
//   getTicketsByStatus: async (status: string): Promise<Ticket[]> => {
//     const response = await fetch(`${API_URL}/status/${status}`);
//     return response.json();
//   },

//   // Create ticket
//   createTicket: async (ticket: TicketRequest): Promise<Ticket> => {
//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(ticket),
//     });
//     return response.json();
//   },

//   // Update ticket status
//   updateTicketStatus: async (id: number, status: string, resolutionNotes?: string): Promise<Ticket> => {
//     const response = await fetch(`${API_URL}/${id}/status`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ status, resolutionNotes }),
//     });
//     return response.json();
//   },

//   // Assign technician
//   assignTechnician: async (ticketId: number, technicianId: number): Promise<Ticket> => {
//     const response = await fetch(`${API_URL}/${ticketId}/assign`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ technicianId }),
//     });
//     return response.json();
//   },

//   // Delete ticket
//   deleteTicket: async (id: number): Promise<void> => {
//     await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
//   },

//   // Add comment
//   addComment: async (comment: { ticketId: number; userId: number; comment: string }): Promise<TicketComment> => {
//     const response = await fetch(`${API_URL}/comments`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(comment),
//     });
//     return response.json();
//   },

//   // Get comments by ticket
//   getCommentsByTicket: async (ticketId: number): Promise<TicketComment[]> => {
//     const response = await fetch(`${API_URL}/${ticketId}/comments`);
//     return response.json();
//   },

//   // Update comment
//   updateComment: async (commentId: number, userId: number, comment: string): Promise<TicketComment> => {
//     const response = await fetch(`${API_URL}/comments/${commentId}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ userId, comment }),
//     });
//     return response.json();
//   },

//   // Delete comment
//   deleteComment: async (commentId: number, userId: number): Promise<void> => {
//     await fetch(`${API_URL}/comments/${commentId}?userId=${userId}`, { method: 'DELETE' });
//   },
// };

import type { Ticket, TicketComment, TicketRequest } from '../types/ticket';

const API_URL = 'http://localhost:8080/api/tickets';

// Helper: get token
const getToken = () => localStorage.getItem('token');

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper: safe JSON parser
const safeJson = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    throw new Error('Empty response from server');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response');
  }
};

export const ticketService = {
  // Get all tickets
  getAllTickets: async (): Promise<Ticket[]> => {
    const response = await fetch(API_URL, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load tickets: ${response.status}`);
    }

    return safeJson(response);
  },

  // Get ticket by id
  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load ticket`);
    }

    return safeJson(response);
  },

  // Get tickets by user
  getTicketsByUser: async (userId: number): Promise<Ticket[]> => {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load user tickets`);
    }

    return safeJson(response);
  },

  // Get tickets by status
  getTicketsByStatus: async (status: string): Promise<Ticket[]> => {
    const response = await fetch(`${API_URL}/status/${status}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load tickets by status`);
    }

    return safeJson(response);
  },

  // Create ticket
  createTicket: async (ticket: TicketRequest): Promise<Ticket> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(ticket),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ticket`);
    }

    return safeJson(response);
  },

  // Update ticket status
  updateTicketStatus: async (
    id: number,
    status: string,
    resolutionNotes?: string
  ): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status, resolutionNotes }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ticket status`);
    }

    return safeJson(response);
  },

  // Assign technician
  assignTechnician: async (
    ticketId: number,
    technicianId: number
  ): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/${ticketId}/assign`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ technicianId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign technician`);
    }

    return safeJson(response);
  },

  // Delete ticket
  deleteTicket: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ticket`);
    }
  },

  // Add comment
  addComment: async (comment: {
    ticketId: number;
    userId: number;
    comment: string;
  }): Promise<TicketComment> => {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(comment),
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment`);
    }

    return safeJson(response);
  },

  // Get comments by ticket
  getCommentsByTicket: async (ticketId: number): Promise<TicketComment[]> => {
    const response = await fetch(`${API_URL}/${ticketId}/comments`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load comments`);
    }

    return safeJson(response);
  },

  // Update comment
  updateComment: async (
    commentId: number,
    userId: number,
    comment: string
  ): Promise<TicketComment> => {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ userId, comment }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update comment`);
    }

    return safeJson(response);
  },

  // Delete comment
  deleteComment: async (commentId: number, userId: number): Promise<void> => {
    const response = await fetch(
      `${API_URL}/comments/${commentId}?userId=${userId}`,
      {
        method: 'DELETE',
        headers: authHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete comment`);
    }
  },
};
