import { useState } from 'react';
import { ticketService } from '../services/ticketService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              ← Back
            </button>
            <CardTitle>Create New Ticket</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

          <div>
            <Label>Title *</Label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Enter ticket title" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label>Description *</Label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue"
              className="w-full border rounded p-2 text-sm min-h-[100px]"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border rounded p-2 text-sm">
                <option value="ELECTRICAL">Electrical</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="IT">IT</option>
                <option value="HVAC">HVAC</option>
                <option value="FURNITURE">Furniture</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <Label>Priority</Label>
              <select name="priority" value={form.priority} onChange={handleChange}
                className="w-full border rounded p-2 text-sm">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Location *</Label>
            <Input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Lab 3, Block A" />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="0771234567"
                maxLength={10}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Images (up to 3, max 2MB each)</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[0, 1, 2].map(index => (
                <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center">
                  {previews[index] ? (
                    <div className="relative">
                      <img
                        src={previews[index]}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-gray-400 text-xs py-4">
                        <div className="text-2xl mb-1">📷</div>
                        <div>Click to upload</div>
                        <div>Image {index + 1}</div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, index)}
                      />
                    </label>
                  )}
                  {errors[`image${index + 1}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`image${index + 1}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}