import { useEffect, useState } from 'react';
import type { Ticket, TicketComment } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface Props {
  ticket: Ticket;
  onBack: () => void;
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
};

function getTimeDiff(from: string, to?: string): string {
  const start = new Date(from).getTime();
  const end = to ? new Date(to).getTime() : Date.now();
  const diff = Math.abs(end - start);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

export default function TicketDetail({ ticket, onBack }: Props) {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [currentUserId] = useState(1);
  const [status, setStatus] = useState(ticket.status);
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');
  const [technicianId, setTechnicianId] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  useEffect(() => {
    loadComments();
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const loadComments = async () => {
    try {
      const data = await ticketService.getCommentsByTicket(ticket.id!);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await ticketService.addComment({
        ticketId: ticket.id!,
        userId: currentUserId,
        comment: newComment,
      });
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId: number) => {
    try {
      await ticketService.updateComment(commentId, currentUserId, editingText);
      setEditingCommentId(null);
      loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await ticketService.deleteComment(commentId, currentUserId);
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await ticketService.updateTicketStatus(ticket.id!, status, resolutionNotes);
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignTechnician = async () => {
    if (!technicianId) return;
    try {
      await ticketService.assignTechnician(ticket.id!, Number(technicianId));
      alert('Technician assigned successfully!');
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };

  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const isInProgress = ticket.status === 'IN_PROGRESS' || isResolved;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="outline" onClick={onBack} className="mb-4">← Back</Button>

      {/* Ticket Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">
              <span className="text-gray-400 text-sm mr-2">#{ticket.id}</span>
              {ticket.title}
            </CardTitle>
            <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[ticket.status]}`}>
              {ticket.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">{ticket.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Category:</span> {ticket.category}</div>
            <div><span className="font-medium">Priority:</span> {ticket.priority}</div>
            <div><span className="font-medium">Location:</span> {ticket.location}</div>
            <div><span className="font-medium">Contact:</span> {ticket.contactDetails}</div>
          </div>
                  {(ticket.image1 || ticket.image2 || ticket.image3) && (
                      <div className="flex gap-2 mt-2">
                          {ticket.image1 && (
                              <img
                                  src={`data:image/jpeg;base64,${ticket.image1}`}
                                  alt="Evidence 1"
                                  className="w-24 h-24 object-cover rounded"
                              />
                          )}
                          {ticket.image2 && (
                              <img
                                  src={`data:image/jpeg;base64,${ticket.image2}`}
                                  alt="Evidence 2"
                                  className="w-24 h-24 object-cover rounded"
                              />
                          )}
                          {ticket.image3 && (
                              <img
                                  src={`data:image/jpeg;base64,${ticket.image3}`}
                                  alt="Evidence 3"
                                  className="w-24 h-24 object-cover rounded"
                              />
                          )}
                      </div>
                  )}
          
          {ticket.resolutionNotes && (
            <div className="bg-green-50 p-3 rounded">
              <span className="font-medium">Resolution Notes:</span> {ticket.resolutionNotes}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Level Timer */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">⏱️ Service Level Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-xs text-gray-500 mb-1">🕐 Time Since Created</p>
              <p className="text-xl font-bold text-blue-700">
                {ticket.createdAt ? getTimeDiff(ticket.createdAt, currentTime) : 'N/A'}
              </p>
              <p className="text-xs text-gray-400">
                Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-xs text-gray-500 mb-1">
                {isResolved ? '✅ Time to Resolution' : '⚡ Time to First Response'}
              </p>
              <p className={`text-xl font-bold ${isResolved ? 'text-green-700' : isInProgress ? 'text-purple-700' : 'text-orange-700'}`}>
                {isResolved
                  ? ticket.updatedAt ? getTimeDiff(ticket.createdAt!, ticket.updatedAt) : 'N/A'
                  : isInProgress
                  ? ticket.updatedAt ? getTimeDiff(ticket.createdAt!, ticket.updatedAt) : 'N/A'
                  : 'Awaiting Response'}
              </p>
              <p className="text-xs text-gray-400">
                Status: {ticket.status}
              </p>
            </div>
          </div>
          <div className="mt-3 bg-white p-3 rounded shadow-sm">
            <p className="text-xs text-gray-500 mb-2">📊 SLA Status</p>
            <div className="flex items-center gap-2">
              {ticket.createdAt && (() => {
                const hours = Math.floor(Math.abs(Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60));
                if (isResolved) return <span className="text-green-600 font-medium">✅ Resolved</span>;
                if (hours < 4) return <span className="text-green-600 font-medium">🟢 Within SLA (under 4 hours)</span>;
                if (hours < 24) return <span className="text-yellow-600 font-medium">🟡 SLA Warning (4-24 hours)</span>;
                return <span className="text-red-600 font-medium">🔴 SLA Breached (over 24 hours)</span>;
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Controls */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Admin Controls</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Update Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border rounded p-2 text-sm mt-1">
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Resolution Notes</label>
              <Input value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Add resolution notes" className="mt-1" />
            </div>
            <Button onClick={handleStatusUpdate}>Update</Button>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Assign Technician (User ID)</label>
              <Input value={technicianId} onChange={e => setTechnicianId(e.target.value)}
                placeholder="Enter technician ID" className="mt-1" />
            </div>
            <Button onClick={handleAssignTechnician}>Assign</Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader><CardTitle>Comments</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="border rounded p-3">
                {editingCommentId === comment.id ? (
                  <div className="flex gap-2">
                    <Input value={editingText} onChange={e => setEditingText(e.target.value)} />
                    <Button onClick={() => handleEditComment(comment.id!)}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">{comment.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        User {comment.userId} • {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                    {comment.userId === currentUserId && (
                      <div className="flex gap-2">
                        <Button variant="outline" className="text-xs h-7"
                          onClick={() => { setEditingCommentId(comment.id!); setEditingText(comment.comment); }}>
                          Edit
                        </Button>
                        <Button variant="outline" className="text-xs h-7 text-red-500"
                          onClick={() => handleDeleteComment(comment.id!)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <div className="flex gap-2 mt-4">
            <Input value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..." />
            <Button onClick={handleAddComment}>Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}