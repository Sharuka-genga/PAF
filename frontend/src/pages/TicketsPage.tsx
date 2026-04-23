import { useEffect, useState } from 'react';
import type { Ticket } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import TicketForm from '../pages/TicketForm';
import TicketDetail from '../pages/TicketDetail';
import UserLayout from '../components/layouts/UserLayout';

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCreated = () => {
    setShowForm(false);
    loadTickets();
  };

  const filteredTickets = filterStatus === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  if (showForm) {
    return <TicketForm onSuccess={handleTicketCreated} onCancel={() => setShowForm(false)} />;
  }

  if (selectedTicket) {
    return <TicketDetail ticket={selectedTicket} onBack={() => { setSelectedTicket(null); loadTickets(); }} />;
  }

  return (
    <UserLayout>
      <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Incident Tickets</h1>
        <Button onClick={() => setShowForm(true)}>+ New Ticket</Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            className="text-sm"
          >
            {status}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading tickets...</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-center text-gray-500">No tickets found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map(ticket => (
            <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTicket(ticket)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>📍 {ticket.location}</span>
                  <span>🏷️ {ticket.category}</span>
                  <span>📅 {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </UserLayout>
  );
}