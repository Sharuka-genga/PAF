import { useState } from 'react';
import { ticketService } from '../services/ticketService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import UserLayout from '../components/layouts/UserLayout';
import PremiumTopbar from '../components/ui/PremiumTopbar';
import { ArrowLeft, AlertCircle, Camera, X } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TicketForm({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    location: '',
    email: '',
    phone: '',
    image1: '',
    image2: '',
    image3: '',
    createdByUserId: '1',
  });
  const [previews, setPreviews] = useState<string[]>(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Real-time validation
    const newErrors = { ...errors };

    if (name === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Invalid email format (example@email.com)';
      } else {
        newErrors.email = '';
      }
    }

    if (name === 'phone') {
      if (!value.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(value.replace(/\s/g, ''))) {
        newErrors.phone = 'Phone must be exactly 10 digits';
      } else {
        newErrors.phone = '';
      }
    }

    setErrors(newErrors);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setErrors({ ...errors, [`image${index + 1}`]: 'Image size must be under 1.5MB' });
      return;
    }

    const base64 = await fileToBase64(file);

    // remove "data:image/...;base64,"
    // const cleanBase64 = base64.split(',')[1];
    const fullBase64 = base64;

    const newPreviews = [...previews];
    newPreviews[index] = base64;
    setPreviews(newPreviews);

    setForm(prev => ({
      ...prev,
      [`image${index + 1}`]: fullBase64
    }));

    // if (index === 0) setForm({ ...form, image1: cleanBase64 });
    // if (index === 1) setForm({ ...form, image2: cleanBase64 });
    // if (index === 2) setForm({ ...form, image3: cleanBase64 });
  };

  const removeImage = (index: number) => {
    const newPreviews = [...previews];
    newPreviews[index] = '';
    setPreviews(newPreviews);
    if (index === 0) setForm({ ...form, image1: '' });
    if (index === 1) setForm({ ...form, image2: '' });
    if (index === 2) setForm({ ...form, image3: '' });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await ticketService.createTicket({
        ...form,
        contactDetails: `Email: ${form.email} | Phone: ${form.phone}`,
      });
      onSuccess();
    } catch (err) {
      setErrors({ general: 'Failed to create ticket. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <main className="flex-1 flex flex-col min-w-0 bg-[#F5F4F8] min-h-screen">
        <PremiumTopbar title="Report Incident" />
        
        <div className="p-6 space-y-6 animate-in fade-in duration-500 mx-auto w-full max-w-[700px]">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Incident Details
            </h2>
          </div>

          <Button variant="ghost" className="mb-4 text-[#9B97B8] hover:text-[#1A1730] hover:bg-transparent -ml-4" onClick={onCancel}>
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>

          <Card className="bg-white border-[1.5px] border-[#E2E0EC] rounded-[14px] shadow-none overflow-hidden pt-0">
            <CardHeader className="bg-purple-50 border-b border-purple-100 py-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-[#7C3AED] flex items-center justify-center gap-2">
                <AlertCircle className="size-4" />
                <span>Create New Ticket</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {errors.general && (
                <div className="bg-[#DC2626]/10 text-[#DC2626] p-3 rounded-[10px] text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="size-4" /> {errors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label className={`font-medium ${errors.title ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>Title *</Label>
                <Input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="Enter ticket title" 
                  className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] ${errors.title ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                />
                {errors.title && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label className={`font-medium ${errors.description ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>Description *</Label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail"
                  className={`w-full bg-white rounded-[10px] border ${errors.description ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#E2E0EC] focus:border-[#7C3AED] focus:ring-[#7C3AED]'} focus:outline-none focus:ring-1 p-3 text-sm text-[#1A1730] min-h-[120px] resize-y`}
                />
                {errors.description && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium text-[#5A5680]">Category</Label>
                  <select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange}
                    className="w-full bg-white h-11 rounded-[10px] border border-[#E2E0EC] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:outline-none px-3 text-[#1A1730] text-sm"
                  >
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="IT">IT</option>
                    <option value="HVAC">HVAC</option>
                    <option value="FURNITURE">Furniture</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-[#5A5680]">Priority</Label>
                  <select 
                    name="priority" 
                    value={form.priority} 
                    onChange={handleChange}
                    className="w-full bg-white h-11 rounded-[10px] border border-[#E2E0EC] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:outline-none px-3 text-[#1A1730] text-sm font-bold"
                  >
                    <option value="LOW" className="text-green-600">Low</option>
                    <option value="MEDIUM" className="text-yellow-600">Medium</option>
                    <option value="HIGH" className="text-orange-600">High</option>
                    <option value="CRITICAL" className="text-red-600">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={`font-medium ${errors.location ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>Location *</Label>
                <Input 
                  name="location" 
                  value={form.location} 
                  onChange={handleChange} 
                  placeholder="e.g. Lab 3, Block A" 
                  className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] ${errors.location ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                />
                {errors.location && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.location}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`font-medium ${errors.email ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>Email *</Label>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] ${errors.email ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                  />
                  {errors.email && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label className={`font-medium ${errors.phone ? 'text-[#DC2626]' : 'text-[#5A5680]'}`}>Phone Number *</Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0771234567"
                    maxLength={10}
                    className={`bg-white h-11 rounded-[10px] border-[#E2E0EC] focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-[#1A1730] font-['DM_Mono'] ${errors.phone ? 'border-[#DC2626] focus-visible:ring-[#DC2626]' : ''}`}
                  />
                  {errors.phone && <p className="text-[#DC2626] text-xs font-medium mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2 pt-2">
                <Label className="font-medium text-[#5A5680] flex items-center justify-between">
                  <span>Images</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#9B97B8] font-black">Up to 3, max 1.5MB</span>
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map(index => (
                    <div key={index} className="relative group">
                      <div className={`border-2 border-dashed rounded-[12px] h-28 flex flex-col items-center justify-center transition-all ${previews[index] ? 'border-transparent' : 'border-[#E2E0EC] bg-[#F5F4F8]/50 hover:bg-[#F5F4F8] hover:border-[#7C3AED]/50'}`}>
                        {previews[index] ? (
                          <div className="relative w-full h-full">
                            <img
                              src={previews[index]}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-[10px] shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px] flex items-center justify-center">
                              <button
                                onClick={() => removeImage(index)}
                                className="bg-white/20 hover:bg-red-500 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            <Camera className="size-6 text-[#9B97B8] mb-2 group-hover:text-[#7C3AED] transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B97B8] group-hover:text-[#7C3AED] transition-colors">
                              Upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageChange(e, index)}
                            />
                          </label>
                        )}
                      </div>
                      {errors[`image${index + 1}`] && (
                        <p className="text-[#DC2626] text-[10px] font-bold mt-1 text-center">{errors[`image${index + 1}`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-black h-12 shadow-lg shadow-purple-100 rounded-[10px] transition-all active:scale-95 text-base tracking-tight disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Ticket...
                    </div>
                  ) : 'Submit Ticket'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </UserLayout>
  );
}