import React, { useState, useEffect } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import type { Resource, ResourceType, ResourceStatus, ResourceRequest, AvailabilityWindow, DayOfWeek } from '../../types/resource';
import { resourceAPI } from '../../services/api';
import {
  BookOpen, Cpu, MessageSquare, Monitor, Camera, LayoutGrid,
  Search, X, Plus, Edit, Trash2, ChevronDown,
  MapPin, Users, Clock, Layers, CheckCircle2, Settings, AlertCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

/* ─── Types ──────────────────────────────────────────────────────── */
type IconComp = LucideIcon;

/* ─── Config ─────────────────────────────────────────────────────── */
const TYPE_CFG: Record<ResourceType, {
  label: string; grad: string; light: string; text: string; border: string; Icon: IconComp;
}> = {
  LECTURE_HALL: { label: 'Lecture Hall', grad: 'from-purple-400 to-purple-700', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', Icon: BookOpen },
  LAB:          { label: 'Laboratory',   grad: 'from-emerald-400 to-emerald-700', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', Icon: Cpu },
  MEETING_ROOM: { label: 'Meeting Room', grad: 'from-amber-400 to-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', Icon: MessageSquare },
  PROJECTOR:    { label: 'Projector',    grad: 'from-rose-400 to-rose-600', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', Icon: Monitor },
  CAMERA:       { label: 'Camera',       grad: 'from-rose-400 to-rose-600', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', Icon: Camera },
  OTHER:        { label: 'Other',        grad: 'from-slate-400 to-slate-600', light: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', Icon: LayoutGrid },
};

const STATUS_CFG: Record<ResourceStatus, { label: string; dot: string; text: string; bg: string }> = {
  ACTIVE:         { label: 'Active',         dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  OUT_OF_SERVICE: { label: 'Out of Service', dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50' },
  MAINTENANCE:    { label: 'Maintenance',    dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50' },
};

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

const ALL_TYPES: ResourceType[] = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'PROJECTOR', 'CAMERA', 'OTHER'];
const ALL_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const ALL_STATUSES: ResourceStatus[] = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

/* ─── Form state ─────────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '',
  type: '' as ResourceType | '',
  status: 'ACTIVE' as ResourceStatus,
  capacity: '',
  location: '',
  description: '',
  availabilityWindows: [] as AvailabilityWindow[],
};
const EMPTY_WIN: AvailabilityWindow = { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '17:00' };
type FormState = typeof EMPTY_FORM;

/* ─── Stat Card Component ─── */
function StatCard({ label, value, color, icon: Icon, bg, border }: { 
  label: string; 
  value: number; 
  color: string; 
  icon: any;
  bg: string;
  border: string;
}) {
  return (
    <div className={`bg-white border-2 ${border} rounded-[2rem] p-6 flex items-center gap-5 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-100/50 hover:-translate-y-2 group relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${bg} rounded-full -mr-16 -mt-16 opacity-40 blur-3xl transition-all duration-700 group-hover:scale-150`} />
      
      <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center relative z-10`} style={{ color }}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      
      <div className="relative z-10">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-gray-900 tracking-tight leading-none">{value}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Units</span>
        </div>
      </div>
    </div>
  );
}

/* ─── iOS Style Scrolling Time Picker ─── */
function ScrollingTimePicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  // value is HH:mm (24h)
  const [h24, m] = value.split(':').map(Number);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  const update = (h: number, min: number, p: string) => {
    let finalH = h % 12;
    if (p === 'PM') finalH += 12;
    const hStr = String(finalH).padStart(2, '0');
    const mStr = String(min).padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  return (
    <div className="flex items-center gap-0 bg-white border border-[#E2E0EC] rounded-xl shadow-sm h-[120px] overflow-hidden relative select-none">
      {/* iOS Center Highlight */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-9 bg-[#F5F4F8] border-y border-[#E2E0EC] z-0 pointer-events-none" />
      
      <ScrollColumn 
        items={hours} 
        selected={h12} 
        onSelect={(h) => update(h, m, period)} 
        format={(h) => String(h).padStart(2, '0')}
      />
      <span className="text-[#1A1730] font-bold z-10 px-0.5">:</span>
      <ScrollColumn 
        items={minutes} 
        selected={m} 
        onSelect={(min) => update(h12, min, period)} 
        format={(min) => String(min).padStart(2, '0')}
      />
      <div className="w-[1px] h-10 bg-[#E2E0EC] z-10 mx-1" />
      <ScrollColumn 
        items={periods} 
        selected={period} 
        onSelect={(p) => update(h12, m, p)} 
      />
    </div>
  );
}

function ScrollColumn<T extends string | number>({ items, selected, onSelect, format }: { 
  items: T[]; 
  selected: T; 
  onSelect: (val: T) => void;
  format?: (val: T) => string;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = React.useState(false);

  React.useEffect(() => {
    if (scrollRef.current && !isScrolling) {
      const idx = items.indexOf(selected);
      scrollRef.current.scrollTo({ top: idx * 36, behavior: 'smooth' });
    }
  }, [selected, items, isScrolling]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory py-[42px] z-10"
      onScroll={(e) => {
        setIsScrolling(true);
        const top = (e.target as HTMLDivElement).scrollTop;
        const idx = Math.round(top / 36);
        if (items[idx] !== undefined && items[idx] !== selected) {
          onSelect(items[idx]);
        }
        // Reset scrolling state after a delay
        const timer = setTimeout(() => setIsScrolling(false), 500);
        return () => clearTimeout(timer);
      }}
    >
      {items.map((item, i) => (
        <div 
          key={i} 
          className={`h-9 flex items-center justify-center snap-center cursor-pointer transition-all duration-300 ${
            item === selected 
              ? 'text-[#7C3AED] font-bold text-[15px]' 
              : 'text-[#9B97B8] text-[13px] opacity-40'
          }`}
          onClick={() => onSelect(item)}
        >
          {format ? format(item) : item}
        </div>
      ))}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function AdminResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [newWin, setNewWin] = useState<AvailabilityWindow>(EMPTY_WIN);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'availability' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const handleBulkStatus = async (status: string) => {
    setBulkLoading(true);
    try {
      const count = selectedIds.length;
      await Promise.all(
        selectedIds.map(id => 
          resourceAPI.patchStatus(id, status)
        )
      );
      setSelectedIds([]);
      load();
      toast.success(`${count} resources updated`);
    } catch (err) {
      toast.error('Failed to update some resources');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} resources?`)) return;
    setBulkLoading(true);
    try {
      const count = selectedIds.length;
      await Promise.all(
        selectedIds.map(id => resourceAPI.delete(id))
      );
      setSelectedIds([]);
      load();
      toast.success(`${count} resources deleted`);
    } catch (err) {
      toast.error('Failed to delete some resources');
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await resourceAPI.getAll();
      setResources(res.data.data || []);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = search
    ? resources.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.location || '').toLowerCase().includes(search.toLowerCase())
      )
    : resources;

  const sortedResources = [...filtered].sort((a, b) => {
    if (sortBy === 'name') 
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name)
    if (sortBy === 'capacity') 
      return sortOrder === 'asc' 
        ? (a.capacity || 0) - (b.capacity || 0)
        : (b.capacity || 0) - (a.capacity || 0)
    if (sortBy === 'status')
      return sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status)
    return 0
  });

  const counts = {
    total: resources.length,
    active: resources.filter(r => r.status === 'ACTIVE').length,
    maint: resources.filter(r => r.status === 'MAINTENANCE').length,
    oos: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setNewWin(EMPTY_WIN);
    setShowModal(true);
  };

  const openEdit = (r: Resource) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      type: r.type,
      status: r.status,
      capacity: r.capacity != null ? String(r.capacity) : '',
      location: r.location || '',
      description: r.description || '',
      availabilityWindows: [...(r.availabilityWindows || [])],
    });
    setNewWin(EMPTY_WIN);
    setImagePreview(r.imageUrl || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setNewWin(EMPTY_WIN);
    setImageFile(null);
    setImagePreview(null);
  };

  const addWindow = () => {
    if (newWin.startTime >= newWin.endTime) {
      toast.error('End time must be after start time');
      return;
    }
    setForm((f) => ({ ...f, availabilityWindows: [...f.availabilityWindows, { ...newWin }] }));
  };

  const removeWindow = (idx: number) => {
    setForm((f) => ({ ...f, availabilityWindows: f.availabilityWindows.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.type) { toast.error('Please select a type'); return; }
    const cap = form.capacity !== '' ? parseInt(form.capacity, 10) : null;
    const payload: ResourceRequest = {
      name: form.name,
      type: form.type as ResourceType,
      status: form.status,
      capacity: cap && !isNaN(cap) ? cap : null,
      location: form.location,
      description: form.description,
      availabilityWindows: form.availabilityWindows,
    };
    setSaving(true);
    try {
      let newResourceId = editingId;
      if (editingId) {
        await resourceAPI.update(editingId, payload);
      } else {
        const response = await resourceAPI.create(payload);
        newResourceId = response.data.data.id;
      }
      
      if (imageFile && newResourceId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await resourceAPI.uploadImage(newResourceId, formData);
      }
      
      toast.success(editingId ? 'Resource updated' : 'Resource created');
      closeModal();
      load();
    } catch {
      toast.error(editingId ? 'Failed to update' : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await resourceAPI.delete(confirmDelete.id);
      toast.success('Resource deleted');
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ch-surface font-sans">
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-ch-purple">Resource Management</h1>

          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={openCreate}
              className="bg-ch-purple text-white rounded-2xl px-6 py-2.5 text-sm font-semibold hover:bg-purple-700 transition-all duration-300 shadow-lg shadow-purple-200 flex items-center gap-2 active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} /> Add New Resource
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Strip */}
          <div className="grid grid-cols-4 gap-6">
            <StatCard label="Total Resources" value={counts.total} color="#7C3AED" icon={Layers} bg="bg-purple-50" border="border-purple-100" />
            <StatCard label="Active" value={counts.active} color="#059669" icon={CheckCircle2} bg="bg-emerald-50" border="border-emerald-100" />
            <StatCard label="In Maintenance" value={counts.maint} color="#D97706" icon={Settings} bg="bg-amber-50" border="border-amber-100" />
            <StatCard label="Out of Service" value={counts.oos} color="#DC2626" icon={AlertCircle} bg="bg-red-50" border="border-red-100" />
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white rounded-2xl border border-ch-border overflow-hidden flex flex-col shadow-sm">
            {/* Search bar above table */}
            <div className="p-4 border-b border-ch-border flex items-center">
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ch-t3" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-ch-surface border border-ch-border rounded-xl w-full pl-9 pr-4 py-2 text-[13px] outline-none focus:ring-1 focus:ring-ch-purple focus:border-ch-purple"
                />
              </div>
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) setSelectedIds([]);
                }}
                className={`ml-auto px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  isSelectMode 
                    ? 'bg-ch-surface text-ch-purple hover:bg-purple-100' 
                    : 'bg-purple-50 text-ch-purple hover:bg-ch-purple hover:text-white'
                }`}
              >
                {isSelectMode ? 'Cancel' : 'Select'}
              </button>
            </div>

            {selectedIds.length > 0 && (
              <div className="mx-4 mb-4 bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-ch-purple font-bold">
                    {selectedIds.length}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Resources Selected</p>
                    <p className="text-[11px] text-gray-500">Perform bulk actions on these items</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-ch-purple transition-colors"
                  >
                    Clear Selection
                  </button>
                  <button
                    disabled={bulkLoading}
                    onClick={handleBulkDelete}
                    className="bg-red-500 text-white rounded-xl px-6 py-2 text-xs font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Delete Selected Items
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-ch-surface border-b border-ch-border">
                  <tr>
                    {isSelectMode && (
                      <th className="px-4 py-3 w-10">
                        <div 
                          onClick={() => {
                            if (selectedIds.length === sortedResources.length) setSelectedIds([]);
                            else setSelectedIds(sortedResources.map(r => r.id));
                          }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                            selectedIds.length > 0 && selectedIds.length === sortedResources.length
                              ? 'bg-ch-purple border-ch-purple'
                              : 'border-ch-border bg-white'
                          }`}
                        >
                          {selectedIds.length === sortedResources.length && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </th>
                    )}
                    <th 
                      onClick={() => {
                        if (sortBy === 'name') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('name'); setSortOrder('asc'); }
                      }}
                      className={`text-left px-4 py-3 text-[10px] uppercase tracking-widest cursor-pointer transition-colors hover:text-[#7C3AED] ${sortBy === 'name' ? 'text-[#7C3AED] font-semibold' : 'text-ch-t3 font-medium'}`}
                    >
                      Resource {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-ch-t3 font-medium">Type</th>
                    <th 
                      onClick={() => {
                        if (sortBy === 'capacity') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('capacity'); setSortOrder('asc'); }
                      }}
                      className={`text-left px-4 py-3 text-[10px] uppercase tracking-widest cursor-pointer transition-colors hover:text-[#7C3AED] ${sortBy === 'capacity' ? 'text-[#7C3AED] font-semibold' : 'text-ch-t3 font-medium'}`}
                    >
                      Capacity {sortBy === 'capacity' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-ch-t3 font-medium">Location</th>
                    <th 
                      onClick={() => {
                        if (sortBy === 'status') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('status'); setSortOrder('asc'); }
                      }}
                      className={`text-left px-4 py-3 text-[10px] uppercase tracking-widest cursor-pointer transition-colors hover:text-[#7C3AED] ${sortBy === 'status' ? 'text-[#7C3AED] font-semibold' : 'text-ch-t3 font-medium'}`}
                    >
                      Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-ch-t3 font-medium">Availability</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-ch-t3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ch-border">
                  {loading ? (
                    <tr>
                      <td colSpan={isSelectMode ? 8 : 7} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="ch-spin w-8 h-8 border-2 border-ch-purple border-t-transparent rounded-full mb-2" />
                          <span className="text-sm text-ch-t3">Loading resources...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={isSelectMode ? 8 : 7} className="px-4 py-20 text-center">
                        <span className="text-sm text-ch-t3">No resources found</span>
                      </td>
                    </tr>
                  ) : (
                    sortedResources.map((r) => {
                      const tc = TYPE_CFG[r.type];
                      const sc = STATUS_CFG[r.status];
                      const Icon = tc.Icon;
                      const isSelected = selectedIds.includes(r.id);
                      return (
                        <tr 
                          key={r.id} 
                          onClick={() => {
                            if (!isSelectMode) return;
                            setSelectedIds(prev => 
                              prev.includes(r.id) 
                                ? prev.filter(id => id !== r.id)
                                : [...prev, r.id]
                            );
                          }}
                          className={`transition-all duration-300 group ${
                            isSelectMode ? 'cursor-pointer' : ''
                          } ${isSelected ? 'bg-purple-50/80' : 'hover:bg-purple-50/30'}`}
                        >
                          {isSelectMode && (
                            <td className="px-4 py-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-ch-purple border-ch-purple shadow-sm scale-110' 
                                  : 'border-[#E2E0EC] bg-white'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200" />}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`${tc.light} w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}>
                                <Icon size={14} className={tc.text} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-ch-t1 truncate">{r.name}</p>
                                <p className="text-[11px] text-ch-t3 truncate">{r.description || 'No description'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`${tc.light} ${tc.text} rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap`}>
                              {tc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-[12px] text-ch-t2">
                              <Users size={12} className="text-ch-t3" />
                              {r.capacity ?? '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-[12px] text-ch-t2">
                              <MapPin size={12} className="text-ch-t3" />
                              <span className="truncate max-w-[120px]">{r.location || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              <span className={`text-[12px] font-medium ${sc.text}`}>{sc.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                              {r.availabilityWindows?.length > 0 ? (
                                <>
                                  {r.availabilityWindows.slice(0, 2).map((w, i) => (
                                    <span key={i} className="bg-purple-50 text-ch-purple border border-purple-200 text-[10px] px-2 py-0.5 rounded font-mono">
                                      {DAY_SHORT[w.dayOfWeek]} {w.startTime}-{w.endTime}
                                    </span>
                                  ))}
                                  {r.availabilityWindows.length > 2 && (
                                    <span className="bg-ch-surface text-ch-t3 text-[10px] px-2 py-0.5 rounded font-medium">
                                      +{r.availabilityWindows.length - 2} more
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-ch-t3 text-[12px]">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(r);
                                }}
                                className="text-ch-purple hover:bg-purple-50 p-1.5 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDelete(r);
                                }}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ch-sidebar/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-ch-purple p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{editingId ? 'Edit Resource' : 'New Resource'}</h2>
                  <p className="text-purple-100 text-xs font-medium mt-1 uppercase tracking-widest">Configuration Panel</p>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-purple-50/30 p-8">
              <form className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-ch-purple rounded-full" />
                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Primary Details</h3>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">Resource Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Research Laboratory"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-ch-surface border-2 border-transparent focus:border-ch-purple/20 focus:bg-white rounded-2xl px-5 py-3 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-900 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">Type</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
                        className="w-full bg-ch-surface border-2 border-transparent focus:border-ch-purple/20 focus:bg-white rounded-2xl px-5 py-3 text-sm outline-none transition-all text-gray-900 font-semibold appearance-none"
                      >
                        <option value="">Select Type</option>
                        {ALL_TYPES.map(t => (
                          <option key={t} value={t}>{TYPE_CFG[t].label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as ResourceStatus })}
                        className="w-full bg-ch-surface border-2 border-transparent focus:border-ch-purple/20 focus:bg-white rounded-2xl px-5 py-3 text-sm outline-none transition-all text-gray-900 font-semibold appearance-none"
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">Capacity</label>
                      <div className="relative">
                        <Users size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={form.capacity}
                          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                          className="w-full bg-ch-surface border-2 border-transparent focus:border-ch-purple/20 focus:bg-white rounded-2xl pl-12 pr-5 py-3 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-900 font-semibold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">Location</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          placeholder="e.g. Block C, Floor 2"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          className="w-full bg-ch-surface border-2 border-transparent focus:border-ch-purple/20 focus:bg-white rounded-2xl pl-12 pr-5 py-3 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-900 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">Description</label>
                    <textarea
                      placeholder="Provide additional context about this resource..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-ch-surface border-2 border-transparent focus:border-ch-purple/20 focus:bg-white rounded-2xl px-5 py-3 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-900 font-semibold min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                {/* Media Section */}
                <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-ch-purple rounded-full" />
                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Media Assets</h3>
                  </div>
                  
                  <div 
                    onClick={() => document.getElementById('imageInput')?.click()}
                    className="relative border-2 border-dashed border-purple-100 rounded-2xl p-8 transition-all hover:bg-purple-50 group cursor-pointer flex flex-col items-center justify-center min-h-[180px] overflow-hidden"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white text-ch-purple px-4 py-2 rounded-xl text-xs font-bold shadow-xl">Change Photo</span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                          className="absolute top-4 right-4 bg-white/90 text-red-500 rounded-xl w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all active:scale-90"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-ch-purple group-hover:scale-110 transition-transform">
                          <Camera size={32} strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-800">Click to upload photo</p>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                    <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                </div>

                {/* Scheduling Section */}
                <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-ch-purple rounded-full" />
                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Availability Windows</h3>
                  </div>

                  <div className="bg-ch-surface rounded-2xl p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">Day</label>
                        <select
                          value={newWin.dayOfWeek}
                          onChange={(e) => setNewWin({ ...newWin, dayOfWeek: e.target.value as DayOfWeek })}
                          className="w-full bg-white border-2 border-transparent focus:border-ch-purple/20 rounded-xl px-4 py-2.5 text-sm outline-none font-semibold appearance-none h-[110px] text-gray-900"
                        >
                          {ALL_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">Start</label>
                        <ScrollingTimePicker 
                          value={newWin.startTime} 
                          onChange={(val) => setNewWin({ ...newWin, startTime: val })} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider ml-1">End</label>
                        <ScrollingTimePicker 
                          value={newWin.endTime} 
                          onChange={(val) => setNewWin({ ...newWin, endTime: val })} 
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addWindow}
                      className="w-full bg-ch-purple/10 text-ch-purple border-2 border-ch-purple/20 rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-ch-purple hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} strokeWidth={3} /> Add Window
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.availabilityWindows.map((w, idx) => (
                      <div key={idx} className="bg-purple-50 border border-purple-200 text-ch-purple px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-3 shadow-sm">
                        <span>{DAY_SHORT[w.dayOfWeek]} • {w.startTime} - {w.endTime}</span>
                        <button
                          type="button"
                          onClick={() => removeWindow(idx)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-gray-50 text-gray-400 rounded-2xl py-4 text-sm font-bold hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSubmit}
                className="flex-[2] bg-ch-purple text-white rounded-2xl py-4 text-sm font-bold hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-100 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Resource'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ch-sidebar/40 backdrop-blur-sm ch-fade-in" onClick={() => setConfirmDelete(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6 ch-modal-in text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-ch-t1 mb-2">Delete Resource?</h3>
            <p className="text-sm text-ch-t3 mb-6">
              Are you sure you want to delete <span className="font-semibold text-ch-t1">"{confirmDelete.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-ch-border rounded-xl py-2.5 text-sm font-medium hover:bg-ch-surface transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
