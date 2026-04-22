import { useState, useEffect } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import type { Resource, ResourceType, ResourceStatus, DayOfWeek } from '../types/resource';
import { resourceAPI } from '../services/api';
import {
  BookOpen, Cpu, MessageSquare, Monitor, Camera, LayoutGrid,
  Search, X, MapPin, Clock, ArrowLeft, ChevronRight, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Types ──────────────────────────────────────────────────────── */
type IconComp = ComponentType<{ size?: number; color?: string; style?: CSSProperties }>;

/* ─── Static config ──────────────────────────────────────────────── */
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
  @keyframes slidePanel { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes dimBg { from { opacity: 0; } to { opacity: 1; } }
  @keyframes cardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .rp-card { animation: cardIn 0.38s ease-out both; transition: transform 0.2s ease, box-shadow 0.2s ease !important; cursor: pointer; }
  .rp-card:hover { transform: translateY(-6px) !important; box-shadow: 0 28px 56px rgba(0,0,0,0.13) !important; }
  .rp-pill { cursor: pointer; transition: all 0.14s ease; }
  .rp-pill:hover { opacity: 0.82; transform: translateY(-1px); }
  .rp-icon-btn { cursor: pointer; background: none; border: none; display: flex; align-items: center; justify-content: center; }
`;

/* ─── Helpers ────────────────────────────────────────────────────── */
function calcDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const m = (eh * 60 + em) - (sh * 60 + sm);
  if (m <= 0) return '';
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`;
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | ''>('');
  const [minCap, setMinCap] = useState('');
  const [dayFilter, setDayFilter] = useState<DayOfWeek | ''>('');
  const [selected, setSelected] = useState<Resource | null>(null);

  useEffect(() => {
    resourceAPI.getAll()
      .then((r) => setResources(r.data.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, []);

  const displayed = resources.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !(r.location || '').toLowerCase().includes(q)) return false;
    }
    if (typeFilter && r.type !== typeFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (minCap) {
      const n = parseInt(minCap);
      if (!isNaN(n) && (r.capacity == null || r.capacity < n)) return false;
    }
    if (dayFilter && !r.availabilityWindows?.some((w) => w.dayOfWeek === dayFilter)) return false;
    return true;
  });

  const hasFilters = !!(search || typeFilter || statusFilter || minCap || dayFilter);

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: '#F7F6F3', minHeight: '100vh' }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <header style={{ background: 'white', borderBottom: '1px solid #EAE8E3', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <ArrowLeft size={15} /> Dashboard
            </Link>
            <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />
            <div>
              <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 20, color: '#0F172A', margin: 0, lineHeight: 1 }}>
                Facilities & Assets
              </h1>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, marginTop: 2, fontWeight: 500 }}>
                {loading ? '…' : `${displayed.length} of ${resources.length} spaces`}
              </p>
            </div>
          </div>
          {user && (
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>{user.name}</span>
            </span>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 64px' }}>

        {/* ── Filters ── */}
        <div style={{ background: 'white', borderRadius: 18, border: '1px solid #EAE8E3', padding: '20px 22px', marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

          {/* Search + Status + Capacity */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                placeholder="Search by name or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', height: 40, paddingLeft: 34, paddingRight: search ? 34 : 12, border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: '"DM Sans", sans-serif', outline: 'none', color: '#0F172A', background: '#FAFAF8', boxSizing: 'border-box' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="rp-icon-btn" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <X size={13} />
                </button>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ResourceStatus | '')}
                style={{ height: 40, paddingLeft: 12, paddingRight: 30, border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontFamily: '"DM Sans", sans-serif', fontWeight: 500, outline: 'none', background: '#FAFAF8', color: '#374151', appearance: 'none', cursor: 'pointer', minWidth: 148 }}
              >
                <option value="">All statuses</option>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
              <ChevronRight size={12} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#9CA3AF', pointerEvents: 'none' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <Users size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                type="number" min={1} placeholder="Min capacity"
                value={minCap}
                onChange={(e) => setMinCap(e.target.value)}
                style={{ height: 40, paddingLeft: 28, paddingRight: 10, border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontFamily: '"DM Sans", sans-serif', outline: 'none', background: '#FAFAF8', color: '#374151', width: 132, boxSizing: 'border-box' }}
              />
            </div>

            {hasFilters && (
              <button onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); setMinCap(''); setDayFilter(''); }}
                className="rp-pill"
                style={{ height: 40, paddingLeft: 14, paddingRight: 14, borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* Type pills */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 11 }}>
            <button onClick={() => setTypeFilter('')} className="rp-pill"
              style={{ height: 32, paddingLeft: 14, paddingRight: 14, borderRadius: 16, fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif', background: typeFilter === '' ? '#0F172A' : 'white', color: typeFilter === '' ? 'white' : '#6B7280', border: `1.5px solid ${typeFilter === '' ? '#0F172A' : '#E5E7EB'}` }}
            >
              All types
            </button>
            {ALL_TYPES.map((type) => {
              const c = TYPE_CFG[type];
              const active = typeFilter === type;
              return (
                <button key={type} onClick={() => setTypeFilter(active ? '' : type)} className="rp-pill"
                  style={{ height: 32, paddingLeft: 11, paddingRight: 14, borderRadius: 16, fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif', display: 'flex', alignItems: 'center', gap: 6, background: active ? c.light : 'white', color: active ? c.text : '#6B7280', border: `1.5px solid ${active ? c.border : '#E5E7EB'}` }}
                >
                  <c.Icon size={12} />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Day pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Available:</span>
            <button onClick={() => setDayFilter('')} className="rp-pill"
              style={{ height: 26, paddingLeft: 11, paddingRight: 11, borderRadius: 13, fontSize: 11, fontWeight: 700, fontFamily: '"DM Sans", sans-serif', background: dayFilter === '' ? '#374151' : 'white', color: dayFilter === '' ? 'white' : '#6B7280', border: `1.5px solid ${dayFilter === '' ? '#374151' : '#E5E7EB'}` }}
            >Any</button>
            {ALL_DAYS.map((day) => {
              const active = dayFilter === day;
              return (
                <button key={day} onClick={() => setDayFilter(active ? '' : day)} className="rp-pill"
                  style={{ height: 26, paddingLeft: 11, paddingRight: 11, borderRadius: 13, fontSize: 11, fontWeight: 700, fontFamily: '"DM Sans", sans-serif', background: active ? '#EEF2FF' : 'white', color: active ? '#4F46E5' : '#6B7280', border: `1.5px solid ${active ? '#C7D2FE' : '#E5E7EB'}` }}
                >
                  {DAY_SHORT[day]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#374151', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search size={28} color="#D1D5DB" />
            </div>
            <p style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 18, color: '#374151', margin: '0 0 8px' }}>No spaces found</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
            {displayed.map((r, idx) => (
              <ResourceCard key={r.id} resource={r} index={idx} onClick={() => setSelected(r)} />
            ))}
          </div>
        )}
      </main>

      {selected && <ResourceDetailPanel resource={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ─── Card ────────────────────────────────────────────────────────── */
function ResourceCard({ resource, index, onClick }: { resource: Resource; index: number; onClick: () => void }) {
  const c = TYPE_CFG[resource.type];
  const s = STATUS_CFG[resource.status];
  const { Icon } = c;

  return (
    <div
      className="rp-card"
      onClick={onClick}
      style={{
        background: 'white', borderRadius: 18, overflow: 'hidden',
        border: '1px solid #EAE8E3', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        animationDelay: `${Math.min(index, 12) * 0.04}s`,
      }}
    >
      {/* Gradient header */}
      <div style={{ background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`, padding: '20px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={24} color="white" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '4px 10px 4px 8px', fontSize: 11, fontWeight: 700, color: s.text }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
            {s.label}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 16, color: 'white', margin: '0 0 4px', lineHeight: 1.3 }}>
            {resource.name}
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 500 }}>{c.label}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 20px 16px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 11, flexWrap: 'wrap' }}>
          {resource.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}>
              <MapPin size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{resource.location}</span>
            </div>
          )}
          {resource.capacity != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}>
              <Users size={12} style={{ color: '#9CA3AF' }} />
              {resource.capacity}
            </div>
          )}
        </div>

        {resource.availabilityWindows?.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {resource.availabilityWindows.slice(0, 3).map((w, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: c.light, color: c.text, border: `1px solid ${c.border}`, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                <Clock size={8} />
                {DAY_SHORT[w.dayOfWeek]} {w.startTime}–{w.endTime}
              </span>
            ))}
            {resource.availabilityWindows.length > 3 && (
              <span style={{ fontSize: 10, color: '#9CA3AF', padding: '3px 4px', fontWeight: 600 }}>
                +{resource.availabilityWindows.length - 3}
              </span>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 11, color: '#D1D5DB', margin: 0, fontStyle: 'italic' }}>No schedule configured</p>
        )}

        <div style={{ marginTop: 13, display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: c.text, display: 'flex', alignItems: 'center', gap: 3, opacity: 0.85 }}>
            View details <ChevronRight size={11} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Panel ────────────────────────────────────────────────── */
function ResourceDetailPanel({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const c = TYPE_CFG[resource.type];
  const s = STATUS_CFG[resource.status];
  const { Icon } = c;

  const sorted = [...(resource.availabilityWindows || [])].sort(
    (a, b) => ALL_DAYS.indexOf(a.dayOfWeek) - ALL_DAYS.indexOf(b.dayOfWeek)
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', animation: 'dimBg 0.2s ease-out' }} />

      <div
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 480, background: 'white', overflowY: 'auto', animation: 'slidePanel 0.28s cubic-bezier(0.16, 1, 0.3, 1)', fontFamily: '"DM Sans", sans-serif' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel header */}
        <div style={{ background: `linear-gradient(145deg, ${c.from} 0%, ${c.to} 100%)`, padding: '32px 28px 28px', position: 'relative' }}>
          <button onClick={onClose} className="rp-icon-btn"
            style={{ position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            <X size={16} />
          </button>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <Icon size={32} color="white" />
          </div>
          <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 26, color: 'white', margin: '0 0 5px', lineHeight: 1.2 }}>
            {resource.name}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 500 }}>{c.label}</p>
        </div>

        {/* Panel body */}
        <div style={{ padding: '24px 28px 48px' }}>
          {/* Status */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.bg, color: s.text, borderRadius: 20, padding: '5px 13px', fontSize: 12, fontWeight: 700 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
              {s.label}
            </div>
          </div>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {resource.location && (
              <div style={{ background: '#F9F8F6', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <MapPin size={12} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</span>
                </div>
                <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0 }}>{resource.location}</p>
              </div>
            )}
            {resource.capacity != null && (
              <div style={{ background: '#F9F8F6', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <Users size={12} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Capacity</span>
                </div>
                <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0 }}>{resource.capacity} people</p>
              </div>
            )}
          </div>

          {/* Description */}
          {resource.description && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>About</p>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 }}>{resource.description}</p>
            </div>
          )}

          {/* Weekly schedule */}
          {sorted.length > 0 && (
            <div>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                Weekly Schedule
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {sorted.map((w, i) => {
                  const dur = calcDuration(w.startTime, w.endTime);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F9F8F6', borderRadius: 11, padding: '11px 14px' }}>
                      <div style={{ width: 44, height: 26, borderRadius: 6, background: c.light, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        {DAY_SHORT[w.dayOfWeek]}
                      </div>
                      <Clock size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>
                        {w.startTime} – {w.endTime}
                      </span>
                      {dur && (
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF', background: '#EAE8E3', borderRadius: 5, padding: '2px 7px', fontWeight: 600 }}>
                          {dur}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
