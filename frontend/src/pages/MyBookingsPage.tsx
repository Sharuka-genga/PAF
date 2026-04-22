import { useState, useEffect } from "react";

import { bookingService } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../components/ui/dialog";
import { toast } from "sonner";
import { Users, Trash2, AlertCircle, MessageSquare, Calendar, Clock } from "lucide-react";
import type { Booking } from "../lib/types";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      toast.error("Failed to sync personal schedule");
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    try {
      await bookingService.cancel(cancellingId);
      toast.success("Booking cancelled successfully");
      setCancellingId(null);
      fetchBookings();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bookingService.delete(id);
      toast.success("Record removed from history");
      fetchBookings();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete record");
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1730]">Manage My Bookings</h1>
        <p className="text-[#9B97B8]">View and manage your current and past facility reservations.</p>
      </div>

      <div className="w-full">
        <Card className="bg-white border-[1.5px] border-[#E2E0EC] rounded-[14px] shadow-none">
          <CardHeader className="border-b border-[#E2E0EC] pb-4">
            <CardTitle className="text-sm uppercase tracking-wider text-[#9B97B8]">My Schedule</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]"></div>
                <p className="text-[#9B97B8] text-sm">Syncing with campus server...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 border-[1.5px] border-dashed border-[#E2E0EC] rounded-[14px] bg-[#F5F4F8]/50">
                 <p className="text-[#5A5680] font-medium">No bookings found for this user.</p>
                 <p className="text-[#9B97B8] text-sm mt-1">Use the "New Booking" button to create your first request.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[10px] border-[1.5px] border-[#E2E0EC]">
                <Table>
                  <TableHeader className="bg-[#F5F4F8]/50">
                    <TableRow className="border-[#E2E0EC]">
                      <TableHead className="font-semibold text-[#5A5680] py-4">Facility & Event</TableHead>
                      <TableHead className="font-semibold text-[#5A5680] py-4">Date</TableHead>
                      <TableHead className="font-semibold text-[#5A5680] py-4">Time Slot</TableHead>
                      <TableHead className="font-semibold text-[#5A5680] py-4 text-center">People</TableHead>
                      <TableHead className="font-semibold text-[#5A5680] py-4 text-center">Status</TableHead>
                      <TableHead className="text-right font-semibold text-[#5A5680] py-4 px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id} className="hover:bg-[#F5F4F8]/80 transition-colors border-[#E2E0EC]">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1A1730] text-sm">{b.resourceName}</span>
                            <span className="text-xs text-[#9B97B8] italic mt-0.5 line-clamp-1 max-w-[200px]" title={b.purpose}>
                              {b.purpose ? `"${b.purpose}"` : "Event"}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-[#5A5680] font-medium text-sm font-['DM_Mono']">
                            <Calendar className="size-3.5 text-[#A78BFA]" />
                            {b.date}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-[#5A5680] text-sm font-['DM_Mono']">
                            <Clock className="size-3.5 text-[#A78BFA]" />
                            <span>{formatTime(b.startTime)} &mdash; {formatTime(b.endTime)}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 text-[#5A5680] bg-[#F5F4F8]/50 border border-[#E2E0EC] px-2 py-1 rounded-[10px]">
                            <Users className="size-3.5" />
                            <span className="text-sm font-semibold font-['DM_Mono']">{b.attendees}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                             <Badge className={`${getStatusVariant(b.status)} border px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold tracking-wide shadow-none uppercase`} variant="outline">
                               {b.status}
                             </Badge>
                             {b.rejectionReason && (
                               <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-[10px] italic font-medium mt-1">
                                 <MessageSquare className="size-3 shrink-0" /> 
                                 <span className="leading-none max-w-[150px] truncate" title={b.rejectionReason}>{b.rejectionReason}</span>
                               </div>
                             )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right px-6">
                          {(b.status === "PENDING" || b.status === "APPROVED") ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setCancellingId(b.id)}
                              className="text-[#DC2626] hover:text-[#DC2626] hover:bg-[#DC2626]/10 p-2 h-9 w-9 rounded-[10px] transition-colors"
                              title="Cancel Booking"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(b.id)}
                              className="text-[#9B97B8] hover:text-[#DC2626] hover:bg-[#DC2626]/10 p-2 h-9 w-9 rounded-[10px] transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={!!cancellingId} onOpenChange={(open) => !open && setCancellingId(null)}>
        <DialogContent className="sm:max-w-md bg-white border-[1.5px] border-[#E2E0EC] rounded-[14px] font-['DM_Sans']">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#DC2626]">
              <AlertCircle className="size-5" /> Confirm Cancellation
            </DialogTitle>
            <DialogDescription className="text-[#9B97B8]">
              Are you sure you want to cancel this booking? This action cannot be undone and your requested timeslot will be opened.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setCancellingId(null)} className="rounded-[10px] text-[#5A5680] hover:bg-[#F5F4F8]">
              No, keep it
            </Button>
            <Button 
              onClick={confirmCancel}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white rounded-[10px]"
            >
              Yes, cancel it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
