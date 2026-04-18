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

export default function TicketForm({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    location: '',
    contactDetails: '',
    image1: '',
    image2: '',
    image3: '',
    createdByUserId: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location || !form.contactDetails) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await ticketService.createTicket(form);
      onSuccess();
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <Label>Title *</Label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Enter ticket title" />
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
          </div>

          <div>
            <Label>Contact Details *</Label>
            <Input name="contactDetails" value={form.contactDetails} onChange={handleChange} placeholder="Phone or email" />
          </div>

          <div>
            <Label>Image URL 1 (optional)</Label>
            <Input name="image1" value={form.image1} onChange={handleChange} placeholder="Image URL" />
          </div>
          <div>
            <Label>Image URL 2 (optional)</Label>
            <Input name="image2" value={form.image2} onChange={handleChange} placeholder="Image URL" />
          </div>
          <div>
            <Label>Image URL 3 (optional)</Label>
            <Input name="image3" value={form.image3} onChange={handleChange} placeholder="Image URL" />
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