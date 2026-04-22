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
import { Users, Trash2, AlertCircle, MessageSquare } from "lucide-react";
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
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200 hover:bg-green-50";
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-50";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-50";
      case "CANCELLED": return "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-50";
      default: return "";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage My Bookings</h1>
        <p className="text-slate-500">View and manage your current and past facility reservations.</p>
      </div>

      <div className="w-full">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg">My Schedule</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-slate-500 text-sm">Syncing with campus server...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30">
                 <p className="text-slate-400 font-medium">No bookings found for this user.</p>
                 <p className="text-slate-300 text-sm mt-1">Use the "New Booking" button to create your first request.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700 text-left">Resource</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-left">Schedule</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-left">Status</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 px-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-semibold text-slate-900 text-sm text-left">
                          {b.resourceName}
                          <div className="text-xs text-slate-500 font-normal mt-1 flex items-center gap-1">
                            <Users className="size-3" /> {b.attendees} attendees
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">{b.date}</span>
                            <span className="text-xs font-medium text-slate-500 mt-0.5">{formatTime(b.startTime)} - {formatTime(b.endTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex flex-col gap-1.5 items-start">
                             <Badge className={`${getStatusVariant(b.status)} border px-2.5 py-1 rounded-md text-xs font-bold tracking-wide shadow-sm`} variant="outline">
                               {b.status}
                             </Badge>
                             {b.rejectionReason && (
                               <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50/80 p-2 rounded-md italic font-medium max-w-[200px] mt-1">
                                 <MessageSquare className="size-3.5 shrink-0 mt-0.5" /> 
                                 <span className="leading-snug">{b.rejectionReason}</span>
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
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 h-9 w-9 rounded-full transition-colors"
                              title="Cancel Booking"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(b.id)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 h-9 w-9 rounded-full transition-colors"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" /> Confirm Cancellation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone and your requested timeslot will be opened.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setCancellingId(null)}>
              No, keep it
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, cancel it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
