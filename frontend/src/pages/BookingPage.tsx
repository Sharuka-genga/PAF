import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
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
import { toast } from "sonner";
import { Calendar, Clock, Users, FileText, MessageSquare, ArrowLeft } from "lucide-react";
import type { Booking } from "../lib/types";

const RESOURCES = [
  { id: "101", name: "Main Lecture Hall (LH-01)", status: "AVAILABLE" },
  { id: "102", name: "Computer Lab (LAB-A)", status: "OUT_OF_SERVICE" },
  { id: "103", name: "Projector (Asset #PRJ-01)", status: "AVAILABLE" },
  { id: "104", name: "Meeting Room (MR-05)", status: "UNAVAILABLE" },
  { id: "105", name: "Faculty Boardroom", status: "AVAILABLE" },
];

export default function BookingPage() {
  const location = useLocation();
  const isCreateView = location.pathname === '/bookings/create';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
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
      const selectedResource = RESOURCES.find(r => r.name === formData.resourceName);
      if (selectedResource && (selectedResource.status === 'OUT_OF_SERVICE' || selectedResource.status === 'UNAVAILABLE')) {
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
    <div className="mx-auto max-w-[1200px] px-4 py-8 space-y-6 animate-in fade-in duration-500">
      <div className={`flex flex-col gap-2 ${isCreateView ? 'w-full mx-auto max-w-[700px]' : ''}`}>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {isCreateView ? "New Booking Request" : "Booking History"}
        </h1>
        <p className="text-slate-500">
          {isCreateView 
            ? "Reserve a campus facility for your upcoming event." 
            : "Track and review all your past and upcoming campus reservations in one convenient place."}
        </p>
      </div>

      <div className="w-full">
        {isCreateView ? (
          /* Reservation Form */
          <div className="mx-auto max-w-[700px]">
            <Button variant="ghost" asChild className="mb-4 text-slate-500 hover:text-slate-700 -ml-4">
              <Link to="/">
                <ArrowLeft className="mr-2 size-4" /> Back
              </Link>
            </Button>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="size-5 text-indigo-600" />
                  Reservation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className={`font-medium ${errors.resourceName ? 'text-red-500' : 'text-slate-700'}`}>Resource</Label>
                    <Select 
                      value={formData.resourceName} 
                      onValueChange={(val) => {
                        setFormData({...formData, resourceName: val});
                        setErrors({...errors, resourceName: ""});
                      }}
                    >
                      <SelectTrigger className={`w-full bg-white h-11 ${errors.resourceName ? 'border-red-500 focus:ring-red-500' : ''}`}>
                        <SelectValue placeholder="Choose a resource..." />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOURCES.map(r => (
                          <SelectItem 
                            key={r.id} 
                            value={r.name}
                            disabled={r.status === 'OUT_OF_SERVICE' || r.status === 'UNAVAILABLE'}
                          >
                            {r.name} {r.status === 'OUT_OF_SERVICE' ? '(Out of Service)' : r.status === 'UNAVAILABLE' ? '(Unavailable)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.resourceName && <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">{errors.resourceName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className={`font-medium ${errors.date ? 'text-red-500' : 'text-slate-700'}`}>Date</Label>
                    <Input 
                      type="date"
                      value={formData.date} 
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={getCurrentDate()}
                      className={`bg-white h-11 ${errors.date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.date && <p className="text-red-500 text-xs font-medium mt-1">{errors.date}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={`flex items-center gap-1 font-medium ${errors.startTime ? 'text-red-500' : 'text-slate-700'}`}>
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
                        className={`bg-white h-11 ${errors.startTime ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {errors.startTime && <p className="text-red-500 text-xs font-medium mt-1">{errors.startTime}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className={`flex items-center gap-1 font-medium ${errors.endTime ? 'text-red-500' : 'text-slate-700'}`}>
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
                        className={`bg-white h-11 ${errors.endTime ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {errors.endTime && <p className="text-red-500 text-xs font-medium mt-1">{errors.endTime}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={`flex items-center gap-1 font-medium ${errors.purpose ? 'text-red-500' : 'text-slate-700'}`}>
                      <FileText className="size-3.5" /> Purpose
                    </Label>
                    <Input 
                      placeholder="e.g., Guest Lecture, Study Group"
                      value={formData.purpose} 
                      onChange={(e) => {
                        setFormData({...formData, purpose: e.target.value});
                        setErrors({...errors, purpose: ""});
                      }}
                      className={`bg-white h-11 ${errors.purpose ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.purpose && <p className="text-red-500 text-xs font-medium mt-1">{errors.purpose}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className={`flex items-center gap-1 font-medium ${errors.attendees ? 'text-red-500' : 'text-slate-700'}`}>
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
                      className={`bg-white h-11 ${errors.attendees ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.attendees && <p className="text-red-500 text-xs font-medium mt-1">{errors.attendees}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-12 shadow-sm transition-all active:scale-95 mt-4 text-base">
                    Confirm Booking
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Bookings List */
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
                        <TableHead className="font-semibold text-slate-700 py-4">Facility & Event</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4">Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4">Time Slot</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 text-center">People</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b) => (
                        <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm">{b.resourceName}</span>
                              <span className="text-xs text-slate-500 italic mt-0.5 line-clamp-1 max-w-[200px]" title={b.purpose}>
                                {b.purpose ? `"${b.purpose}"` : "Event"}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
                              <Calendar className="size-3.5 text-slate-400" />
                              {b.date}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                              <Clock className="size-3.5 text-slate-400" />
                              <span>{formatTime(b.startTime)} &mdash; {formatTime(b.endTime)}</span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="inline-flex items-center justify-center gap-1.5 text-slate-600 bg-slate-50 border px-2 py-1 rounded-md">
                              <Users className="size-3.5" />
                              <span className="text-sm font-semibold">{b.attendees}</span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex flex-col gap-1.5 items-center justify-center">
                               <Badge className={`${getStatusVariant(b.status)} border px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide shadow-sm`} variant="outline">
                                 {b.status}
                               </Badge>
                               {b.rejectionReason && (
                                 <div className="flex items-center justify-center gap-1.5 text-[11px] text-red-600 bg-red-50/80 px-2 py-0.5 rounded-md italic font-medium">
                                   <MessageSquare className="size-3 shrink-0" /> 
                                   <span className="leading-none max-w-[150px] truncate" title={b.rejectionReason}>{b.rejectionReason}</span>
                                 </div>
                               )}
                            </div>
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
  );
}
