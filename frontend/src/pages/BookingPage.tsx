import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { bookingService } from "../lib/api";
import type { Resource } from "../types/resource";
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
import { toast } from "sonner";
import { Calendar, Clock, Users, FileText, MessageSquare, ArrowLeft, X } from "lucide-react";
import type { Booking } from "../lib/types";


export default function BookingPage() {
  const location = useLocation();
  const isCreateView = location.pathname === '/bookings/create';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [minTime, setMinTime] = useState("");
  const [minEndTime, setMinEndTime] = useState("");
  const [formData, setFormData] = useState({
    resourceName: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBookings();
    fetchResources();
    // Update current time every minute
    const interval = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const res = await bookingService.getAllResources();
      // Handle potential ApiResponse wrapper or direct array
      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setResources(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        setResources(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch resources", error);
      toast.error("Failed to load campus resources");
    } finally {
      setLoadingResources(false);
    }
  };

  const getCurrentDate = () => currentDateTime.toISOString().split('T')[0];
  const getCurrentTime = () => currentDateTime.toTimeString().slice(0, 5);

  const isPastBooking = (date: string, time: string) => {
    const bookingDateTime = new Date(`${date}T${time}:00`);
    return bookingDateTime <= currentDateTime;
  };

  const isToday = (date: string) => date === getCurrentDate();

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, startTime: "", endTime: "" }); // Reset times when date changes
    setErrors({ ...errors, date: "", startTime: "", endTime: "" });
    if (isToday(date)) {
      setMinTime(getCurrentTime());
    } else {
      setMinTime("");
    }
    setMinEndTime("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.resourceName) {
      newErrors.resourceName = "Please select a resource";
      isValid = false;
    } else {
      const selectedResource = resources.find(r => r.name === formData.resourceName);
      if (selectedResource && (selectedResource.status === 'OUT_OF_SERVICE' || selectedResource.status === 'MAINTENANCE')) {
        newErrors.resourceName = "Resource currently unavailable";
        isValid = false;
      }
    }

    if (!formData.date) {
      newErrors.date = "Please select a booking date";
      isValid = false;
    }

    if (!formData.startTime) {
      newErrors.startTime = "Please select a start time";
      isValid = false;
    } else if (formData.startTime < '08:00' || formData.startTime > '22:00') {
      newErrors.startTime = "Booking times must be between 8:00 AM and 10:00 PM";
      isValid = false;
    }

    if (!formData.endTime) {
      newErrors.endTime = "Please select an end time";
      isValid = false;
    } else if (formData.endTime < '08:00' || formData.endTime > '22:00') {
      newErrors.endTime = "Booking times must be between 8:00 AM and 10:00 PM";
      isValid = false;
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "Start time must be before end time";
      isValid = false;
    }
    
    if (!formData.purpose) {
      newErrors.purpose = "Please provide a purpose";
      isValid = false;
    }

    if (formData.attendees < 1) {
      newErrors.attendees = "Must have at least 1 attendee";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
    if (!validateForm()) return;

    // Check if booking is in the past
    if (isPastBooking(formData.date, formData.startTime)) {
      setErrors({...errors, date: "Cannot book a time slot in the past. Please select a future date and time."});
      return;
    }

    // For today's bookings, ensure times are not past
    if (isToday(formData.date)) {
      if (formData.startTime <= getCurrentTime()) {
        setErrors({...errors, startTime: "For today's bookings, start time must be in the future."});
        return;
      }
      if (formData.endTime <= getCurrentTime()) {
        setErrors({...errors, endTime: "For today's bookings, end time must be in the future."});
        return;
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
        setErrors({});
        return 'Booking requested successfully!';
      },
      error: (err) => {
        const errorMsg = err.response?.data?.message || '';
        if (errorMsg.toLowerCase().includes('conflict')) {
            return "This time slot is already reserved";
        }
        return errorMsg || 'Failed to submit booking request';
      }
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    const promise = bookingService.cancel(id as any);
    toast.promise(promise, {
      loading: 'Cancelling booking...',
      success: () => { fetchBookings(); return 'Booking cancelled.'; },
      error: 'Failed to cancel booking.'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-[#059669]/10 text-[#059669] border-[#059669]/20 font-['DM_Sans']";
      case "PENDING": return "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20 font-['DM_Sans']";
      case "REJECTED": return "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 font-['DM_Sans']";
      case "CANCELLED": return "bg-[#E2E0EC]/50 text-[#5A5680] border-[#E2E0EC] font-['DM_Sans']";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F4F8] font-['DM_Sans'] pb-12">
      <div className="mx-auto max-w-[1200px] px-4 py-8 space-y-6 animate-in fade-in duration-500">
        <div className={`flex flex-col gap-2 ${isCreateView ? 'w-full mx-auto max-w-[700px]' : ''}`}>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1730]">
            {isCreateView ? "New Booking Request" : "Booking History"}
          </h1>
          <p className="text-[#9B97B8]">
            {isCreateView 
              ? "Reserve a campus facility for your upcoming event." 
              : "Track and review all your past and upcoming campus reservations in one convenient place."}
          </p>
        </div>

      <div className="w-full">
        {isCreateView ? (
          /* Reservation Form */
          <div className="mx-auto max-w-[700px]">
            <Button variant="ghost" asChild className="mb-4 text-[#9B97B8] hover:text-[#1A1730] hover:bg-transparent -ml-4">
              <Link to="/">
                <ArrowLeft className="mr-2 size-4" /> Back
              </Link>
            </Button>
            <Card className="bg-white border-[1.5px] border-[#E2E0EC] rounded-[14px] shadow-none overflow-hidden pt-0">
              <CardHeader className="bg-[#7C3AED]">
                <CardTitle className="text-sm uppercase tracking-wider text-white flex items-center gap-2">
                  <Calendar className="size-4 text-white/80" />
                  Reservation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className={`font-medium ${errors.resourceName ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>Resource</Label>
                    <Select 
                      value={formData.resourceName} 
                      onValueChange={(val) => {
                        setFormData({...formData, resourceName: val});
                        setErrors({...errors, resourceName: ""});
                      }}
                    >
                      <SelectTrigger className={`w-full bg-white h-11 rounded-[10px] border-[#E2E0EC] focus:border-[#7C3AED] focus:ring-[#7C3AED] text-[#1A1730] ${errors.resourceName ? 'border-[#DC2626] focus:ring-[#DC2626]' : ''}`}>
                        <SelectValue placeholder="Choose a resource..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#E2E0EC] rounded-[12px] shadow-lg p-1 min-w-[400px]">
                        {loadingResources ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7C3AED]"></div>
                          </div>
                        ) : resources.length === 0 ? (
                          <div className="py-4 text-center text-[#9B97B8] text-sm italic">
                            No resources available
                          </div>
                        ) : (
                          resources.map(r => (
                            <SelectItem 
                              key={r.id} 
                              value={r.name}
                              disabled={r.status === 'OUT_OF_SERVICE' || r.status === 'MAINTENANCE'}
                              className={`rounded-[8px] py-2.5 px-3 my-0.5 cursor-pointer text-sm font-medium
                                ${r.status === 'OUT_OF_SERVICE' || r.status === 'MAINTENANCE'
                                  ? 'text-[#9B97B8] opacity-50 cursor-not-allowed'
                                  : 'text-[#1A1730] hover:bg-[#F5F4F8] focus:bg-[#F5F4F8]'
                                }`}
                            >
                              <span className="flex items-center justify-between w-full gap-3">
                                <span className="flex flex-col">
                                  <span>{r.name}</span>
                                  <span className="text-[10px] text-[#9B97B8] font-normal">{r.location || 'No location set'}</span>
                                </span>
                                {r.status === 'OUT_OF_SERVICE' && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full shrink-0">Out of Service</span>
                                )}
                                {r.status === 'MAINTENANCE' && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded-full shrink-0">Maintenance</span>
                                )}
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.resourceName && <p className="text-[#DC2626] text-xs font-medium flex items-center gap-1 mt-1">{errors.resourceName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className={`font-medium ${errors.date ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>Date</Label>
                    <Input 
                      type="date"
                      value={formData.date} 
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={getCurrentDate()}
                      className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] font-['DM_Mono'] ${errors.date ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                    />
                    {errors.date && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.date}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={`flex items-center gap-1 font-medium ${errors.startTime ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>
                        <Clock className="size-3.5" /> Start Time
                      </Label>
                      <Input 
                        type="time"
                        value={formData.startTime} 
                        onChange={(e) => {
                          setFormData({...formData, startTime: e.target.value});
                          setMinEndTime(e.target.value || minTime);
                          setErrors({...errors, startTime: ""});
                        }}
                        min={minTime}
                        className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] font-['DM_Mono'] ${errors.startTime ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                      />
                      {errors.startTime && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.startTime}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className={`flex items-center gap-1 font-medium ${errors.endTime ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>
                        <Clock className="size-3.5" /> End Time
                      </Label>
                      <Input 
                        type="time"
                        value={formData.endTime} 
                        onChange={(e) => {
                          setFormData({...formData, endTime: e.target.value});
                          setErrors({...errors, endTime: ""});
                        }}
                        min={minEndTime || minTime}
                        className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] font-['DM_Mono'] ${errors.endTime ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                      />
                      {errors.endTime && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.endTime}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={`flex items-center gap-1 font-medium ${errors.purpose ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>
                      <FileText className="size-3.5" /> Purpose
                    </Label>
                    <Input 
                      placeholder="e.g., Guest Lecture, Study Group"
                      value={formData.purpose} 
                      onChange={(e) => {
                        setFormData({...formData, purpose: e.target.value});
                        setErrors({...errors, purpose: ""});
                      }}
                      className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] ${errors.purpose ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                    />
                    {errors.purpose && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.purpose}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className={`flex items-center gap-1 font-medium ${errors.attendees ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>
                      <Users className="size-3.5" /> Attendees Expected
                    </Label>
                    <Input 
                      type="number"
                      min="1"
                      value={formData.attendees} 
                      onChange={(e) => {
                        setFormData({...formData, attendees: parseInt(e.target.value) || 0});
                        setErrors({...errors, attendees: ""});
                      }}
                      className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] font-['DM_Mono'] ${errors.attendees ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                    />
                    {errors.attendees && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.attendees}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-medium h-12 shadow-none rounded-[10px] transition-all active:scale-95 mt-4 text-base">
                    Confirm Booking
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Bookings List */
          <Card className="bg-white border-[1.5px] border-[#E2E0EC] rounded-[14px] shadow-none overflow-hidden pt-0">
            <CardHeader className="bg-[#7C3AED]">
              <CardTitle className="text-sm uppercase tracking-wider text-white">My Schedule</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <div className="animate-spin rounded-[10px] h-8 w-8 border-b-2 border-[#7C3AED]"></div>
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
                        <TableHead className="font-semibold text-[#5A5680] py-4 text-center">Actions</TableHead>
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
                                 <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-[10px] italic font-medium">
                                   <MessageSquare className="size-3 shrink-0" /> 
                                   <span className="leading-none max-w-[150px] truncate" title={b.rejectionReason}>{b.rejectionReason}</span>
                                 </div>
                               )}
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(b.id)}
                                className="text-[#DC2626] hover:text-white hover:bg-[#DC2626] border border-[#DC2626]/30 hover:border-[#DC2626] rounded-[8px] h-8 px-3 text-xs font-semibold transition-all gap-1.5"
                              >
                                <X className="size-3" /> Cancel
                              </Button>
                            )}
                            {(b.status === 'CANCELLED' || b.status === 'REJECTED') && (
                              <span className="text-[#9B97B8] text-xs">—</span>
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
        )}
      </div>
    </div>
    </div>
  );
}
