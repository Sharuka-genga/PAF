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

export default function TicketDetail({ ticket, onBack }: Props) {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [currentUserId] = useState(1);
  const [status, setStatus] = useState(ticket.status);
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');
  const [technicianId, setTechnicianId] = useState('');

  useEffect(() => {
    loadComments();
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="outline" onClick={onBack} className="mb-4">← Back</Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{ticket.title}</CardTitle>
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

          {/* Images */}
          {(ticket.image1 || ticket.image2 || ticket.image3) && (
            <div className="flex gap-2 mt-2">
              {ticket.image1 && <img src={ticket.image1} alt="Evidence 1" className="w-24 h-24 object-cover rounded" />}
              {ticket.image2 && <img src={ticket.image2} alt="Evidence 2" className="w-24 h-24 object-cover rounded" />}
              {ticket.image3 && <img src={ticket.image3} alt="Evidence 3" className="w-24 h-24 object-cover rounded" />}
            </div>
          )}

          {ticket.resolutionNotes && (
            <div className="bg-green-50 p-3 rounded">
              <span className="font-medium">Resolution Notes:</span> {ticket.resolutionNotes}
            </div>
          )}
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

          {/* Add Comment */}
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