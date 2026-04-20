import { useState, useEffect } from "react";
import { bookingService } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { toast } from "sonner";
import { Calendar, Clock, Users, FileText, Trash2, AlertCircle, MessageSquare } from "lucide-react";

const RESOURCES = [
  { id: "101", name: "Main Lecture Hall (LH-01)" },
  { id: "102", name: "Computer Lab (LAB-A)" },
  { id: "103", name: "Projector (Asset #PRJ-01)" },
  { id: "104", name: "Meeting Room (MR-05)" },
  { id: "105", name: "Faculty Boardroom" },
];

export default function BookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [minTime, setMinTime] = useState("");
  const [minEndTime, setMinEndTime] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    resourceName: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: 1
  });

  useEffect(() => {
    fetchBookings();
    // Update current time every minute
    const interval = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentDate = () => currentDateTime.toISOString().split('T')[0];
  const getCurrentTime = () => currentDateTime.toTimeString().slice(0, 5);

  const isPastBooking = (date: string, time: string) => {
    const bookingDateTime = new Date(`${date}T${time}:00`);
    return bookingDateTime <= currentDateTime;
  };

  const isToday = (date: string) => date === getCurrentDate();

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, startTime: "", endTime: "" }); // Reset times when date changes
    if (isToday(date)) {
      setMinTime(getCurrentTime());
    } else {
      setMinTime("");
    }
    setMinEndTime("");
  };

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.resourceName) return toast.error("Please select a resource");
    if (!formData.date) return toast.error("Please select a booking date");
    if (!formData.startTime) return toast.error("Please select a start time");
    if (!formData.endTime) return toast.error("Please select an end time");
    if (formData.startTime >= formData.endTime) {
      return toast.error("Start time must be before end time");
    }

    // Check if booking is in the past
    if (isPastBooking(formData.date, formData.startTime)) {
      return toast.error("Cannot book a time slot in the past. Please select a future date and time.");
    }

    // For today's bookings, ensure times are not past
    if (isToday(formData.date)) {
      if (formData.startTime <= getCurrentTime()) {
        return toast.error("For today's bookings, start time must be in the future.");
      }
      if (formData.endTime <= getCurrentTime()) {
        return toast.error("For today's bookings, end time must be in the future.");
      }
    }

    const promise = bookingService.create({
      ...formData,
      attendees: parseInt(formData.attendees.toString()),
      startTime: `${formData.startTime}:00`,
      endTime: `${formData.endTime}:00`
    });

    toast.promise(promise, {
      loading: 'Submitting booking request...',
      success: () => {
        fetchBookings();
        setFormData({ resourceName: "", date: "", startTime: "", endTime: "", purpose: "", attendees: 1 });
        return 'Booking requested successfully!';
      },
      error: (err) => err.response?.data?.message || 'Conflict: This slot is already taken'
    });
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    try {
      await bookingService.cancel(cancellingId);
      toast.success("Booking cancelled successfully");
      setCancellingId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Bookings</h1>
        <p className="text-slate-500">Reserve campus facilities and track your requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* Reservation Form */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="size-5 text-indigo-600" />
              New Reservation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Resource</Label>
                <Select 
                  value={formData.resourceName} 
                  onValueChange={(val) => setFormData({...formData, resourceName: val})}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Choose a resource..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCES.map(r => (
                      <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Date</Label>
                <Input 
                  type="date"
                  value={formData.date} 
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getCurrentDate()}
                  required 
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 flex items-center gap-1 font-medium">
                    <Clock className="size-3" /> Start
                  </Label>
                  <Input 
                    type="time"
                    value={formData.startTime} 
                    onChange={(e) => {
                      setFormData({...formData, startTime: e.target.value});
                      setMinEndTime(e.target.value || minTime);
                    }}
                    min={minTime}
                    required 
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 flex items-center gap-1 font-medium">
                    <Clock className="size-3" /> End
                  </Label>
                  <Input 
                    type="time"
                    value={formData.endTime} 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    min={minEndTime || minTime}
                    required 
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 flex items-center gap-1 font-medium">
                  <FileText className="size-3" /> Purpose
                </Label>
                <Input 
                  placeholder="e.g., Guest Lecture"
                  value={formData.purpose} 
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  required 
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 flex items-center gap-1 font-medium">
                  <Users className="size-3" /> Attendees
                </Label>
                <Input 
                  type="number"
                  min="1"
                  value={formData.attendees} 
                  onChange={(e) => setFormData({...formData, attendees: parseInt(e.target.value)})}
                  required 
                  className="bg-white"
                />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 shadow-sm transition-all active:scale-95 mt-2">
                Confirm Booking
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
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
                 <p className="text-slate-300 text-sm">Use the form to create your first request.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Resource</TableHead>
                      <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 px-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900 uppercase tracking-tight text-xs">
                          {b.resourceName}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">{b.date}</span>
                            <span className="text-xs text-slate-500">{formatTime(b.startTime)} - {formatTime(b.endTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 items-start">
                             <Badge className={`${getStatusVariant(b.status)} border px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider`} variant="outline">
                               {b.status}
                             </Badge>
                             {b.rejectionReason && (
                               <div className="flex items-center gap-1 text-[10px] text-red-500 bg-red-50 p-1 rounded italic font-medium">
                                 <MessageSquare className="size-2.5" /> {b.rejectionReason}
                               </div>
                             )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-4">
                          {(b.status === "PENDING" || b.status === "APPROVED") ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setCancellingId(b.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 h-8 w-8 rounded-full transition-colors"
                              title="Cancel Booking"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-300 italic font-medium px-2">No actions</span>
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
              Are you sure you want to cancel this booking? This action cannot be undone and the resource will be made available for others.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setCancellingId(null)}>
              No, keep it
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, cancel booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
