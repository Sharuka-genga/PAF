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
      case "APPROVED": return "bg-[#059669]/10 text-[#059669] border-[#059669]/20";
      case "PENDING": return "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20";
      case "REJECTED": return "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20";
      case "CANCELLED": return "bg-[#E2E0EC]/50 text-[#5A5680] border-[#E2E0EC]";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F4F8] font-['DM_Sans'] pb-12">
    <div className="mx-auto max-w-[1200px] px-4 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1730]">Admin Management</h1>
          <p className="text-[#9B97B8]">Review and moderate facility booking requests across campus.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-[12px] border border-[#E2E0EC] shadow-none">
          <div className="flex items-center gap-2 px-3 text-[#9B97B8] text-xs uppercase tracking-wider font-medium border-r border-[#E2E0EC] pr-4">
            <Filter className="size-4" /> Filter
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] border-none shadow-none focus:ring-0 text-[#1A1730]">
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

      <Card className="bg-white border-[1.5px] border-[#E2E0EC] rounded-[14px] shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#F5F4F8]/50 border-b border-[#E2E0EC]">
              <TableRow className="border-[#E2E0EC]">
                <TableHead className="font-semibold text-[#5A5680] py-4">ID</TableHead>
                <TableHead className="font-semibold text-[#5A5680] py-4">Resource</TableHead>
                <TableHead className="font-semibold text-[#5A5680] py-4">Schedule</TableHead>
                <TableHead className="font-semibold text-[#5A5680] py-4">Purpose</TableHead>
                <TableHead className="font-semibold text-[#5A5680] py-4 text-center">People</TableHead>
                <TableHead className="font-semibold text-[#5A5680] py-4 text-center">Status</TableHead>
                <TableHead className="text-right font-semibold text-[#5A5680] py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]"></div>
                      <p className="text-[#9B97B8] text-sm font-medium">Loading requests...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-[#9B97B8]">
                      <Info className="size-10 opacity-20" />
                      <div>
                        <p className="font-medium text-[#5A5680]">No bookings found for the selected filter.</p>
                        <p className="text-sm text-[#9B97B8]">Try changing the status filter above.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id} className="hover:bg-[#F5F4F8]/80 transition-colors border-[#E2E0EC]">
                    <TableCell className="font-['DM_Mono'] text-xs text-[#9B97B8]">#{b.id}</TableCell>
                    <TableCell className="font-semibold text-[#1A1730]">{b.resourceName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-[#5A5680] font-['DM_Mono']">{b.date}</span>
                        <span className="text-xs text-[#9B97B8] flex items-center gap-1 font-['DM_Mono']">
                          <Clock className="size-3 text-[#A78BFA]" />
                          {formatTime(b.startTime)} - {formatTime(b.endTime)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-[#5A5680] text-sm italic" title={b.purpose}>
                      "{b.purpose}"
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[#5A5680]">
                        <Users className="size-3.5" />
                        <span className="text-sm font-medium font-['DM_Mono']">{b.attendees}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1.5 items-center justify-center">
                        <Badge className={`${getStatusVariant(b.status)} border px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold tracking-wider uppercase`} variant="outline">
                          {b.status}
                        </Badge>
                        {b.rejectionReason && (
                          <div className="flex items-center justify-center gap-1 text-[11px] text-[#DC2626] bg-[#DC2626]/10 px-1.5 py-0.5 rounded-[8px] italic">
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
                            className="bg-[#059669]/10 text-[#059669] border-[#059669]/20 hover:bg-[#059669]/20 h-8 rounded-[10px]"
                          >
                            <CheckCircle2 className="size-4 mr-1.5" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setRejectingId(b.id)}
                            className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 hover:bg-[#DC2626]/20 h-8 rounded-[10px]"
                          >
                            <XCircle className="size-4 mr-1.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9B97B8] font-medium italic">No actions available</span>
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
        <DialogContent className="sm:max-w-md bg-white border-[1.5px] border-[#E2E0EC] rounded-[14px] font-['DM_Sans']">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#DC2626]">
              <XCircle className="size-5" /> Reject Booking Request
            </DialogTitle>
            <DialogDescription className="text-[#9B97B8]">
              Please provide a reason for rejecting this booking. This will be visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="e.g., The room is reserved for emergency repairs."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="resize-none min-h-[100px] rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectingId(null)} className="h-10 rounded-[10px] text-[#5A5680] hover:bg-[#F5F4F8]">
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white h-10 px-8 rounded-[10px]"
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
