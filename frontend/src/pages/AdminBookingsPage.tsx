import { useState, useEffect } from "react";
import { bookingService } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Filter, MessageSquare, Info, Clock, Users } from "lucide-react";
import type { Booking } from "../lib/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const filter = statusFilter === "ALL" ? undefined : statusFilter;
      const res = await bookingService.getAllBookings(filter);
      setBookings(res.data);
    } catch (error) {
      console.error("Failed to fetch all bookings", error);
      toast.error("Could not sync with campus server");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await bookingService.approve(id);
      toast.success("Booking approved successfully");
      fetchBookings();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve booking");
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    if (!rejectionReason.trim()) return toast.error("Please provide a reason for rejection");

    try {
      await bookingService.reject(rejectingId, rejectionReason);
      toast.success("Booking rejected");
      setRejectingId(null);
      setRejectionReason("");
      fetchBookings();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      case "CANCELLED": return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "";
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Management</h1>
          <p className="text-slate-500">Review and moderate facility booking requests across campus.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 px-3 text-slate-500 text-sm font-medium border-r pr-4">
            <Filter className="size-4" /> Filter by Status
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="All Bookings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Bookings</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-md border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 py-4">ID</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">Resource</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">Schedule</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">Purpose</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 text-center">People</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 text-center">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <p className="text-slate-500 text-sm font-medium">Loading requests...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Info className="size-10 opacity-20" />
                      <div>
                        <p className="font-medium">No bookings found for the selected filter.</p>
                        <p className="text-sm">Try changing the status filter above.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-400">#{b.id}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{b.resourceName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-700">{b.date}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatTime(b.startTime)} - {formatTime(b.endTime)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-600 text-sm italic" title={b.purpose}>
                      "{b.purpose}"
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-600">
                        <Users className="size-3.5" />
                        <span className="text-sm font-medium">{b.attendees}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1.5 items-center justify-center">
                        <Badge className={`${getStatusVariant(b.status)} border px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider`} variant="outline">
                          {b.status}
                        </Badge>
                        {b.rejectionReason && (
                          <div className="flex items-center justify-center gap-1 text-[11px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded italic">
                            <MessageSquare className="size-3" /> {b.rejectionReason}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      {b.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApprove(b.id)}
                            className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 h-8"
                          >
                            <CheckCircle2 className="size-4 mr-1.5" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setRejectingId(b.id)}
                            className="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 h-8"
                          >
                            <XCircle className="size-4 mr-1.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 font-medium italic">No actions available</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rejection Reason Dialog */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <XCircle className="size-5" /> Reject Booking Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking. This will be visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="e.g., The room is reserved for emergency repairs."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="resize-none min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectingId(null)} className="h-10">
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              className="bg-rose-600 hover:bg-rose-700 text-white h-10 px-8"
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
