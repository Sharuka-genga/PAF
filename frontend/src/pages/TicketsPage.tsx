import { useEffect, useState } from 'react';
import type { Ticket } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import TicketForm from '../pages/TicketForm';
import TicketDetail from '../pages/TicketDetail';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(true);

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

  const handleDeleteTicket = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await ticketService.deleteTicket(id);
      loadTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const filteredTickets = tickets
    .filter(t => filterStatus === 'ALL' || t.status === filterStatus)
    .filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(t.id).includes(searchQuery)
    )
    .sort((a, b) => sortDesc ? (b.id ?? 0) - (a.id ?? 0) : (a.id ?? 0) - (b.id ?? 0));

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  };

  if (showForm) {
    return <TicketForm onSuccess={handleTicketCreated} onCancel={() => setShowForm(false)} />;
  }

  if (selectedTicket) {
    return <TicketDetail ticket={selectedTicket} onBack={() => { setSelectedTicket(null); loadTickets(); }} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Incident Tickets</h1>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            onClick={() => setSortDesc(!sortDesc)}
          >
            {sortDesc ? '↓ Latest First' : '↑ Oldest First'}
          </button>
          <Button onClick={() => setShowForm(true)}>+ New Ticket</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <Card className="text-center p-3 bg-yellow-50">
          <p className="text-2xl font-bold text-yellow-700">{stats.total}</p>
          <p className="text-xs text-yellow-600">Total</p>
        </Card>
        <Card className="text-center p-3 bg-blue-50">
          <p className="text-2xl font-bold text-blue-700">{stats.open}</p>
          <p className="text-xs text-blue-500">Open</p>
        </Card>
        <Card className="text-center p-3 bg-purple-50">
          <p className="text-2xl font-bold text-purple-700">{stats.inProgress}</p>
          <p className="text-xs text-purple-500">In Progress</p>
        </Card>
        <Card className="text-center p-3 bg-green-50">
          <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
          <p className="text-xs text-green-500">Resolved</p>
        </Card>
        <Card className="text-center p-3 bg-pink-50">
          <p className="text-2xl font-bold text-pink-700">{stats.closed}</p>
          <p className="text-xs text-pink-600">Closed</p>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="🔍 Search by ID, title, description or location..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
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

      {/* Ticket List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading tickets...</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-center text-gray-500">No tickets found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map(ticket => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg">
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded mr-2">ID-{ticket.id}</span>
                      {ticket.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <button
                    className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 mt-1"
                    onClick={(e) => handleDeleteTicket(ticket.id!, e)}
                  >
                    Delete
                  </button>
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
  );
}