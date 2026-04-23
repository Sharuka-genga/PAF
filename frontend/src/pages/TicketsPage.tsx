import { useEffect, useState } from 'react';
import type { Ticket } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import TicketForm from '../pages/TicketForm';
import TicketDetail from '../pages/TicketDetail';

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
  REJECTED: 'bg-red-100 text-red-700',
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
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-purple-700">
            Incident Tickets
          </h1>
          <p className="text-sm text-gray-500">
            Campus Operations Hub
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200"
            onClick={() => setSortDesc(!sortDesc)}
          >
            {sortDesc ? '↓ Latest' : '↑ Oldest'}
          </button>

          <Button onClick={() => setShowForm(true)}>
            + New Ticket
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="text-center p-4 bg-gray-50 rounded-xl">
          <p className="text-xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </Card>

        <Card className="text-center p-4 bg-blue-50 rounded-xl">
          <p className="text-xl font-bold text-blue-600">{stats.open}</p>
          <p className="text-sm text-blue-500">Open</p>
        </Card>

        <Card className="text-center p-4 bg-purple-50 rounded-xl">
          <p className="text-xl font-bold text-purple-600">{stats.inProgress}</p>
          <p className="text-sm text-purple-500">In Progress</p>
        </Card>

        <Card className="text-center p-4 bg-green-50 rounded-xl">
          <p className="text-xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-sm text-green-500">Resolved</p>
        </Card>

        <Card className="text-center p-4 bg-gray-100 rounded-xl">
          <p className="text-xl font-bold text-gray-700">{stats.closed}</p>
          <p className="text-sm text-gray-500">Closed</p>
        </Card>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <Input
          placeholder="🔍 Search tickets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* CARDS */}
      {loading ? (
        <p className="text-center text-gray-500">Loading tickets...</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-center text-gray-500">No tickets found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map(ticket => (
            <Card
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="p-4 rounded-[14px] border border-[#E2E0EC] bg-white flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition cursor-pointer"
            >

              {/* TOP CONTENT */}
              <div>

                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-lg font-semibold text-[#1A1730]">

                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-2">
                      #{String(ticket.id).padStart(3, '0')}
                    </span>

                    {ticket.title}

                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  <p className="text-sm text-[#5A5680] mb-3 line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-[#9B97B8]">
                    <span>📍 {ticket.location}</span>
                    <span>
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </CardContent>

              </div>

              {/* 🔥 BOTTOM RIGHT DELETE BUTTON */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={(e) => handleDeleteTicket(ticket.id!, e)}
                  className="px-3 py-1 text-xs font-medium rounded-[10px] border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>

            </Card>
          ))}
        </div>
      )}
    </div>
  );
}