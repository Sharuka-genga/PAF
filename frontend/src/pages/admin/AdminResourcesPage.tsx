import { useState, useEffect } from 'react';
import type { ComponentType, CSSProperties, FormEvent } from 'react';
import type { Resource, ResourceType, ResourceStatus, ResourceRequest, AvailabilityWindow, DayOfWeek } from '../../types/resource';
import { resourceAPI } from '../../services/api';
import {
  BookOpen, Cpu, MessageSquare, Monitor, Camera, LayoutGrid,
  Search, X, ArrowLeft, Plus, Edit, Trash2, ChevronDown,
  MapPin, Users, Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

/* ─── Types ──────────────────────────────────────────────────────── */
type IconComp = ComponentType<{ size?: number; color?: string; style?: CSSProperties }>;

/* ─── Config ─────────────────────────────────────────────────────── */
const TYPE_CFG: Record<ResourceType, {
  label: string; from: string; to: string;
  light: string; text: string; border: string; Icon: IconComp;
}> = {
  LECTURE_HALL: { label: 'Lecture Hall', from: '#2563eb', to: '#1d4ed8', light: '#eff6ff', text: '#2563eb', border: '#bfdbfe', Icon: BookOpen as IconComp },
  LAB:          { label: 'Laboratory',   from: '#8b5cf6', to: '#7c3aed', light: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', Icon: Cpu as IconComp },
  MEETING_ROOM: { label: 'Meeting Room', from: '#14b8a6', to: '#0d9488', light: '#f0fdfa', text: '#0d9488', border: '#99f6e4', Icon: MessageSquare as IconComp },
  PROJECTOR:    { label: 'Projector',    from: '#f97316', to: '#ea580c', light: '#fff7ed', text: '#ea580c', border: '#fed7aa', Icon: Monitor as IconComp },
  CAMERA:       { label: 'Camera',       from: '#ec4899', to: '#db2777', light: '#fdf2f8', text: '#db2777', border: '#fbcfe8', Icon: Camera as IconComp },
  OTHER:        { label: 'Other',        from: '#64748b', to: '#475569', light: '#f8fafc', text: '#475569', border: '#e2e8f0', Icon: LayoutGrid as IconComp },
};

const STATUS_CFG: Record<ResourceStatus, { label: string; bg: string; text: string; dot: string }> = {
  ACTIVE:         { label: 'Active',         bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  OUT_OF_SERVICE: { label: 'Out of Service', bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  MAINTENANCE:    { label: 'Maintenance',    bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' },
};

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

const ALL_TYPES: ResourceType[] = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'PROJECTOR', 'CAMERA', 'OTHER'];
const ALL_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const ALL_STATUSES: ResourceStatus[] = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
  @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes dimBg { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ar-row { transition: background 0.12s ease; }
  .ar-row:hover { background: #FAFAF8 !important; }
  .ar-btn { cursor: pointer; border: none; background: none; transition: all 0.14s ease; display: flex; align-items: center; justify-content: center; }
  .ar-btn:hover { opacity: 0.75; transform: scale(1.08); }
  .ar-pill { cursor: pointer; transition: all 0.14s ease; }
  .ar-pill:hover { opacity: 0.82; }
  input:focus, select:focus, textarea:focus { border-color: #94A3B8 !important; outline: none; }
`;

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

/* ─── Page ────────────────────────────────────────────────────────── */
export default function AdminResourcesPage() {
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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setNewWin(EMPTY_WIN);
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
      if (editingId) {
        await resourceAPI.update(editingId, payload);
        toast.success('Resource updated');
      } else {
        await resourceAPI.create(payload);
        toast.success('Resource created');
      }
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

  /* ── Input style ── */
  const inp: CSSProperties = {
    width: '100%', height: 40, padding: '0 12px', border: '1.5px solid #E5E7EB',
    borderRadius: 10, fontSize: 14, fontFamily: '"DM Sans", sans-serif',
    color: '#0F172A', background: 'white', boxSizing: 'border-box',
  };
  const sel: CSSProperties = { ...inp, appearance: 'none', cursor: 'pointer' };
  const lbl: CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block', fontFamily: '"DM Sans", sans-serif' };

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: '#F7F6F3', minHeight: '100vh' }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <header style={{ background: 'white', borderBottom: '1px solid #EAE8E3', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <ArrowLeft size={15} /> Admin
            </Link>
            <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />
            <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 19, color: '#0F172A', margin: 0 }}>
              Resource Management
            </h1>
          </div>
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, paddingLeft: 16, paddingRight: 18, background: '#0F172A', color: 'white', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: '"DM Sans", sans-serif', transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1E293B')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0F172A')}
          >
            <Plus size={15} /> Add Resource
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 64px' }}>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            <input
              placeholder="Search resources…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inp, paddingLeft: 34 }}
            />
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="ar-btn" style={{ color: '#9CA3AF' }}>
              <X size={14} />
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
            {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#374151', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9CA3AF' }}>
            <p style={{ fontFamily: '"Syne", sans-serif', fontSize: 16, fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>No resources</p>
            <p style={{ fontSize: 13, margin: 0 }}>Click "Add Resource" to create one</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 18, border: '1px solid #EAE8E3', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9F8F6', borderBottom: '1.5px solid #EAE8E3' }}>
                  {['Resource', 'Type', 'Capacity', 'Location', 'Status', 'Availability', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const tc = TYPE_CFG[r.type];
                  const sc = STATUS_CFG[r.status];
                  const { Icon } = tc;
                  return (
                    <tr key={r.id} className="ar-row" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F2EF' : 'none' }}>
                      {/* Resource name */}
                      <td style={{ padding: '14px 18px', maxWidth: 220 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: tc.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={16} style={{ color: tc.text }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                            {r.description && (
                              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{r.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: tc.light, color: tc.text, border: `1px solid ${tc.border}`, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
                          <Icon size={10} />
                          {tc.label}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td style={{ padding: '14px 18px' }}>
                        {r.capacity != null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', fontWeight: 500 }}>
                            <Users size={12} style={{ color: '#9CA3AF' }} />
                            {r.capacity}
                          </div>
                        ) : <span style={{ color: '#D1D5DB', fontSize: 16 }}>—</span>}
                      </td>

                      {/* Location */}
                      <td style={{ padding: '14px 18px' }}>
                        {r.location ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151' }}>
                            <MapPin size={12} style={{ color: '#9CA3AF' }} />
                            {r.location}
                          </div>
                        ) : <span style={{ color: '#D1D5DB', fontSize: 16 }}>—</span>}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
                          {sc.label}
                        </span>
                      </td>

                      {/* Availability */}
                      <td style={{ padding: '14px 18px' }}>
                        {r.availabilityWindows?.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {r.availabilityWindows.slice(0, 2).map((w, j) => (
                              <span key={j} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: tc.light, color: tc.text, border: `1px solid ${tc.border}`, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>
                                <Clock size={8} />
                                {DAY_SHORT[w.dayOfWeek]} {w.startTime}–{w.endTime}
                              </span>
                            ))}
                            {r.availabilityWindows.length > 2 && (
                              <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>+{r.availabilityWindows.length - 2}</span>
                            )}
                          </div>
                        ) : <span style={{ color: '#D1D5DB', fontSize: 16 }}>—</span>}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => openEdit(r)} className="ar-btn"
                            style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', color: '#2563EB' }}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button onClick={() => setConfirmDelete(r)} className="ar-btn"
                            style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF2F2', color: '#DC2626' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={closeModal}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', animation: 'dimBg 0.2s ease-out' }} />
          <div
            style={{ position: 'relative', background: 'white', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', animation: 'modalIn 0.25s ease-out', fontFamily: '"DM Sans", sans-serif' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ padding: '22px 26px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 20, color: '#0F172A', margin: 0 }}>
                {editingId ? 'Edit Resource' : 'New Resource'}
              </h2>
              <button onClick={closeModal} className="ar-btn"
                style={{ width: 32, height: 32, borderRadius: 8, background: '#F3F4F6', color: '#6B7280' }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '0 26px 26px' }}>

              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Physics Lecture Hall A" required style={inp} />
              </div>

              {/* Type + Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={lbl}>Type *</label>
                  <div style={{ position: 'relative' }}>
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ResourceType }))} required style={sel}>
                      <option value="">Select type</option>
                      {ALL_TYPES.map((t) => <option key={t} value={t}>{TYPE_CFG[t].label}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Status *</label>
                  <div style={{ position: 'relative' }}>
                    <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ResourceStatus }))} required style={sel}>
                      {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Capacity + Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={lbl}>Capacity <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                  <div style={{ position: 'relative' }}>
                    <Users size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    <input type="number" min={1} placeholder="e.g. 50" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} style={{ ...inp, paddingLeft: 28 }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    <input placeholder="e.g. Block A, Room 101" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} style={{ ...inp, paddingLeft: 28 }} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description…" rows={2}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: '"DM Sans", sans-serif', color: '#0F172A', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Availability Windows */}
              <div style={{ marginBottom: 22 }}>
                <label style={lbl}>Availability Windows</label>

                {/* Builder row */}
                <div style={{ background: '#F9F8F6', borderRadius: 12, padding: '14px', border: '1.5px solid #E5E7EB', marginBottom: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center' }}>
                    {/* Day select */}
                    <div style={{ position: 'relative' }}>
                      <select
                        value={newWin.dayOfWeek}
                        onChange={(e) => setNewWin((w) => ({ ...w, dayOfWeek: e.target.value as DayOfWeek }))}
                        style={{ ...sel, height: 38, fontSize: 13 }}
                      >
                        {ALL_DAYS.map((d) => (
                          <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    </div>

                    {/* Start */}
                    <input type="time" value={newWin.startTime} onChange={(e) => setNewWin((w) => ({ ...w, startTime: e.target.value }))}
                      style={{ height: 38, padding: '0 10px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontFamily: '"DM Sans", sans-serif', background: 'white', color: '#0F172A', boxSizing: 'border-box' }}
                    />

                    {/* End */}
                    <input type="time" value={newWin.endTime} onChange={(e) => setNewWin((w) => ({ ...w, endTime: e.target.value }))}
                      style={{ height: 38, padding: '0 10px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontFamily: '"DM Sans", sans-serif', background: 'white', color: '#0F172A', boxSizing: 'border-box' }}
                    />

                    {/* Add button */}
                    <button type="button" onClick={addWindow}
                      style={{ height: 38, width: 38, borderRadius: 10, background: '#0F172A', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.14s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1E293B')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#0F172A')}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: '8px 0 0', fontWeight: 500 }}>
                    Select day and time range, then press + to add
                  </p>
                </div>

                {/* Window chips */}
                {form.availabilityWindows.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {form.availabilityWindows.map((w, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #BFDBFE', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20 }}>
                        <Clock size={10} />
                        {DAY_SHORT[w.dayOfWeek]} {w.startTime}–{w.endTime}
                        <button type="button" onClick={() => removeWindow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', padding: 0, display: 'flex', opacity: 0.7, lineHeight: 1 }}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 18, borderTop: '1.5px solid #F3F2EF' }}>
                <button type="button" onClick={closeModal}
                  style={{ flex: 1, height: 42, borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', color: '#374151' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 2, height: 42, borderRadius: 10, background: saving ? '#94A3B8' : '#0F172A', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'background 0.15s' }}
                >
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', animation: 'dimBg 0.2s ease-out' }} />
          <div
            style={{ position: 'relative', background: 'white', borderRadius: 18, padding: '28px 28px 24px', width: '100%', maxWidth: 400, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', animation: 'modalIn 0.22s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Trash2 size={22} color="#DC2626" />
            </div>
            <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 18, color: '#0F172A', margin: '0 0 8px' }}>Delete resource?</h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 22px', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700, color: '#374151' }}>"{confirmDelete.name}"</span> will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, height: 42, borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', color: '#374151' }}
              >
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, height: 42, borderRadius: 10, background: deleting ? '#FCA5A5' : '#DC2626', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'background 0.15s' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
