import { useEffect, useState } from 'react';
import type { Ticket, TicketComment } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';

interface Props {
  ticket: Ticket;
  onBack: () => void;
}

function getTimeDiff(from: string, to?: string): string {
  const start = new Date(from).getTime();
  const end = to ? new Date(to).getTime() : Date.now();
  const diff = Math.abs(end - start);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  OPEN: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  IN_PROGRESS: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  RESOLVED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};

const priorityConfig: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
};

export default function TicketDetail({ ticket, onBack }: Props) {
  console.log("IMAGES:", ticket.image1, ticket.image2, ticket.image3);
  const { user } = useAuth();
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [currentUserId] = useState(user?.id || '1');
  const [status, setStatus] = useState(ticket.status);
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');
  const [technicianId, setTechnicianId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
    const timer = setInterval(() => setCurrentTime(new Date().toISOString()), 60000);
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
      await ticketService.addComment({ ticketId: ticket.id!, userId: currentUserId, comment: newComment });
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
      await ticketService.assignTechnician(ticket.id!, technicianId);
      alert('Technician assigned successfully!');
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };

  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const isInProgress = ticket.status === 'IN_PROGRESS' || isResolved;
  const sc = statusConfig[ticket.status] || statusConfig['OPEN'];

  const getSLA = () => {
    if (!ticket.createdAt) return null;
    const hours = Math.floor(Math.abs(Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60));
    if (isResolved) return { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50', icon: '✅' };
    if (hours < 4) return { label: 'Within SLA', color: 'text-green-600', bg: 'bg-green-50', icon: '🟢' };
    if (hours < 24) return { label: 'SLA Warning', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡' };
    return { label: 'SLA Breached', color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' };
  };

  const sla = getSLA();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F4F8' }}>
      <div className="max-w-4xl mx-auto p-6 space-y-4">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
        >
          ← Back to Tickets
        </button>

        {/* Ticket Header */}
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden shadow-sm">
          {/* Purple gradient top bar */}
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />

          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg border border-gray-200">
                  ID-{ticket.id}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${priorityConfig[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${sc.bg} ${sc.text}`}>
                  🏷️ {ticket.category}
                </span>
              </div>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                <span className={`w-2 h-2 rounded-full ${sc.dot} animate-pulse`}></span>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
            <p className="text-gray-500 mb-5">{ticket.description}</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🏷️', label: 'CATEGORY', value: ticket.category },
                { icon: '📍', label: 'LOCATION', value: ticket.location },
                { icon: '📞', label: 'CONTACT', value: ticket.contactDetails },
                { icon: '📅', label: 'CREATED', value: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{item.icon} {item.label}</p>
                  <p className="text-sm font-medium text-gray-700">{item.value}</p>
                </div>
              ))}
            </div>

            {(ticket.image1 || ticket.image2 || ticket.image3) && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {[ticket.image1, ticket.image2, ticket.image3]
                  .filter(Boolean)
                  .map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={
                          img && img.trim() !== ""
                            ? img
                            : "https://dummyimage.com/200x200/e5e7eb/6b7280&text=No+Image"
                        }
                        alt={`Evidence ${i + 1}`}
                        onClick={() => img && setPreviewImage(img)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://dummyimage.com/200x200/e5e7eb/6b7280&text=No+Image";
                        }}
                        className="w-28 h-28 object-cover rounded-xl border border-[#E2E0EC] cursor-pointer hover:scale-105 transition"
                      />

                    </div>
                  ))}
              </div>
            )}

            {ticket.resolutionNotes && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs uppercase tracking-wide text-green-600 mb-1">✅ Resolution Notes</p>
                <p className="text-sm text-green-800">{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* SLA Timer */}
        <div className="bg-white rounded-2xl border-[1.5px] border-purple-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#7C3AED' }}>
              ⏱️ Service Level Timer
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-0 border-t border-gray-100">
            <div className="p-4 text-center border-r border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Time Since Created</p>
              <p className="text-2xl font-bold" style={{ color: '#7C3AED' }}>
                {ticket.createdAt ? getTimeDiff(ticket.createdAt, currentTime) : 'N/A'}
              </p>
            </div>
            <div className="p-4 text-center border-r border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{isResolved ? 'Time to Resolution' : 'Time to Response'}</p>
              <p className="text-2xl font-bold text-blue-600">
                {isInProgress && ticket.updatedAt ? getTimeDiff(ticket.createdAt!, ticket.updatedAt) : 'Pending'}
              </p>
            </div>
            <div className={`p-4 text-center ${sla?.bg}`}>
              <p className="text-xs text-gray-400 mb-1">SLA Status</p>
              <p className={`text-lg font-bold ${sla?.color}`}>{sla?.icon} {sla?.label}</p>
            </div>
          </div>
        </div>

        {/* admin component */}
        {/* <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">🔧 Admin Controls</h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide text-gray-400 mb-1.5 block">Update Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full border-[1.5px] border-gray-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:border-purple-400 transition-colors">
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide text-gray-400 mb-1.5 block">Resolution Notes</label>
                <Input value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Add resolution notes"
                  className="border-[1.5px] border-gray-200 rounded-xl focus:border-purple-400" />
              </div>
              <button onClick={handleStatusUpdate}
                className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#7C3AED' }}>
                Update
              </button>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide text-gray-400 mb-1.5 block">Assign Technician (User ID)</label>
                <Input value={technicianId} onChange={e => setTechnicianId(e.target.value)}
                  placeholder="Enter technician ID"
                  className="border-[1.5px] border-gray-200 rounded-xl focus:border-purple-400" />
              </div>
              <button onClick={handleAssignTechnician}
                className="px-5 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all">
                Assign
              </button>
            </div>
          </div>
        </div> */}

        {/* Comment section */}
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            💬 Comments <span className="ml-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#F0EBFF', color: '#7C3AED' }}>{comments.length}</span>
          </h2>
          <div className="space-y-3 mb-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300 text-3xl mb-2">💬</p>
                <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {editingCommentId === comment.id ? (
                    <div className="flex gap-2">
                      <Input value={editingText} onChange={e => setEditingText(e.target.value)}
                        className="border-[1.5px] border-purple-200 rounded-xl flex-1" />
                      <button onClick={() => handleEditComment(comment.id!)}
                        className="px-3 py-1.5 text-white text-xs font-semibold rounded-xl"
                        style={{ backgroundColor: '#7C3AED' }}>Save</button>
                      <button onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: '#7C3AED' }}>
                            {comment.userId}
                          </span>
                          <span className="text-xs text-gray-400">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 ml-8">{comment.comment}</p>
                      </div>
                      {comment.userId === currentUserId && (
                        <div className="flex gap-1.5 ml-2">
                          <button onClick={() => { setEditingCommentId(comment.id!); setEditingText(comment.comment); }}
                            className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteComment(comment.id!)}
                            className="text-xs px-2.5 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Input value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="border-[1.5px] border-gray-200 rounded-xl focus:border-purple-400 flex-1" />
            <button onClick={handleAddComment}
              className="px-5 py-2 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: '#7C3AED' }}>
              Post
            </button>
          </div>
        </div>

      </div>
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-4xl max-h-[90vh] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}