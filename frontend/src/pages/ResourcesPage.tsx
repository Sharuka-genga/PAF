import React, { useState, useEffect } from 'react';

import type { Resource, ResourceType, ResourceStatus, DayOfWeek } from '../types/resource';
import { resourceAPI } from '../services/api';
import { BookOpen, Cpu, MessageSquare, Monitor, Camera, LayoutGrid, Search, X, MapPin, Clock, Users, ChevronRight, Layers, CheckCircle2, Settings, AlertCircle, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import FloorMap from '../components/FloorMap';

type IconComp = LucideIcon;

const T: Record<ResourceType, { label: string; grad: string; Icon: IconComp }> = {
  LECTURE_HALL: { label: 'Lecture Hall', grad: 'linear-gradient(135deg,#a855f7,#6d28d9)', Icon: BookOpen },
  LAB:          { label: 'Laboratory',   grad: 'linear-gradient(135deg,#34d399,#059669)', Icon: Cpu },
  MEETING_ROOM: { label: 'Meeting Room', grad: 'linear-gradient(135deg,#fbbf24,#d97706)', Icon: MessageSquare },
  PROJECTOR:    { label: 'Projector',    grad: 'linear-gradient(135deg,#f87171,#dc2626)', Icon: Monitor },
  CAMERA:       { label: 'Camera',       grad: 'linear-gradient(135deg,#f472b6,#db2777)', Icon: Camera },
  OTHER:        { label: 'Other',        grad: 'linear-gradient(135deg,#94a3b8,#475569)', Icon: LayoutGrid },
};

const S: Record<ResourceStatus, { label: string; bg: string; text: string; dot: string }> = {
  ACTIVE:         { label: 'Active',         bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  OUT_OF_SERVICE: { label: 'Out of Service', bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  MAINTENANCE:    { label: 'Maintenance',    bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' },
};

const DAY_S: Record<DayOfWeek, string> = {
  MONDAY:'Mon',TUESDAY:'Tue',WEDNESDAY:'Wed',THURSDAY:'Thu',FRIDAY:'Fri',SATURDAY:'Sat',SUNDAY:'Sun',
};

const ALL_TYPES: ResourceType[] = ['LECTURE_HALL','LAB','MEETING_ROOM','PROJECTOR','CAMERA','OTHER'];
const ALL_DAYS:  DayOfWeek[]    = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const ALL_ST:    ResourceStatus[]= ['ACTIVE','OUT_OF_SERVICE','MAINTENANCE'];

function calcDur(s: string, e: string) {
  const m = (parseInt(e)*60+parseInt(e.split(':')[1]))-(parseInt(s)*60+parseInt(s.split(':')[1]));
  if (m<=0) return '';
  return m>=60 ? `${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}` : `${m}m`;
}

/* ── Chip ── */
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex',alignItems:'center',gap:4,fontSize:11,padding:'4px 10px',
      borderRadius:999,border:`1px solid ${active?'#a855f7':'#E2E0EC'}`,cursor:'pointer',
      background:active?'#f3e8ff':'white',color:active?'#7c3aed':'#5A5680',fontWeight:active?600:400,
      transition:'all .13s',
    }}>{children}</button>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <div 
      className="relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex-1 bg-white border border-[#E2E0EC]/60"
      style={{ 
        background: `linear-gradient(135deg, ${color}08 0%, white 100%)`,
      }}
    >
      <div 
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-10 transition-all duration-500 group-hover:scale-125"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div 
            className="rounded-xl p-2 shadow-inner transition-all duration-300 group-hover:bg-white"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            <Icon size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#9B97B8]">{label}</span>
        </div>
        
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-black text-[#1A1730] tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
            {value}
          </h3>
          <span className="text-[10px] font-bold text-[#9B97B8]">Units</span>
        </div>

      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter]     = useState<ResourceType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | ''>('');
  const [dayFilter, setDayFilter]       = useState<DayOfWeek | ''>('');
  const [minCapacity, setMinCapacity]   = useState<number | ''>('');
  const [activeTab, setActiveTab]       = useState<'ALL' | 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT'>('ALL');
  const [selected, setSelected]         = useState<Resource | null>(null);
  const [view, setView]                 = useState<'Grid'|'List'|'Map'>('Grid');
  const [sortBy, setSortBy]             = useState<'name' | 'capacity' | 'availability' | 'status'>('name');
  const [sortOrder, setSortOrder]       = useState<'asc' | 'desc'>('asc');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [sortOpen, setSortOpen]         = useState(false);

  useEffect(() => {
    resourceAPI.getAll()
      .then(r => {
        console.log('Resources API response:', r);
        setResources(r.data.data || r.data || []);
      })
      .catch(err => {
        console.error('Failed to fetch resources:', err);
        toast.error('Failed to load resources');
        setResources([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const displayed = resources.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !(r.location||'').toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    if (activeTab === 'LECTURE_HALL' && r.type !== 'LECTURE_HALL') return false;
    if (activeTab === 'LAB' && r.type !== 'LAB') return false;
    if (activeTab === 'MEETING_ROOM' && r.type !== 'MEETING_ROOM') return false;
    if (activeTab === 'EQUIPMENT' && !['PROJECTOR', 'CAMERA', 'OTHER'].includes(r.type)) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (dayFilter && !r.availabilityWindows?.some(w => w.dayOfWeek === dayFilter)) return false;
    if (minCapacity !== '' && (r.capacity || 0) < minCapacity) return false;
    return true;
  });

  const sortedDisplayed = [...displayed].sort((a, b) => {
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
    if (sortBy === 'availability') {
      const aAvail = a.availabilityWindows?.length || 0;
      const bAvail = b.availabilityWindows?.length || 0;
      return sortOrder === 'asc' ? aAvail - bAvail : bAvail - aAvail;
    }
    return 0
  });

  const counts = {
    total:   resources.length,
    active:  resources.filter(r => r.status==='ACTIVE').length,
    maint:   resources.filter(r => r.status==='MAINTENANCE').length,
    oos:     resources.filter(r => r.status==='OUT_OF_SERVICE').length,
  };

  const tabCounts = {
    ALL: resources.length,
    LECTURE_HALL: resources.filter(r => r.type === 'LECTURE_HALL').length,
    LAB: resources.filter(r => r.type === 'LAB').length,
    MEETING_ROOM: resources.filter(r => r.type === 'MEETING_ROOM').length,
    EQUIPMENT: resources.filter(r => ['PROJECTOR', 'CAMERA', 'OTHER'].includes(r.type)).length,
  };

  const maxCap = resources.length > 0 ? Math.max(...resources.map(r => r.capacity || 0)) : 100;

  const isAdminUser = user?.roles?.includes('ADMIN');

  const activeFilterCount = [typeFilter, statusFilter, dayFilter, minCapacity !== '' ? 'cap' : ''].filter(Boolean).length;

  const SORT_OPTIONS: { value: string; label: string }[] = [
    { value: 'name-asc',        label: 'Name A–Z' },
    { value: 'name-desc',       label: 'Name Z–A' },
    { value: 'capacity-desc',   label: 'Capacity (High–Low)' },
    { value: 'capacity-asc',    label: 'Capacity (Low–High)' },
    { value: 'availability-desc', label: 'Availability %' },
    { value: 'status-asc',      label: 'Status' },
  ];
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === `${sortBy}-${sortOrder}`)?.label ?? 'Name A–Z';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F5F4F8', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Main area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Topbar */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 h-20 flex items-center justify-between px-8 sticky top-0 z-30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)] transition-all">
          {/* Left side: title */}
          <div>
            <h1 className="text-2xl font-black text-[#7C3AED] tracking-tight">Facilities &amp; Assets</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Campus Operations Hub</p>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7C3AED] transition-all duration-300" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Find resources..."
                className="h-11 pl-11 pr-10 border-2 border-transparent bg-gray-50/50 rounded-2xl text-[13px] font-semibold text-gray-900 focus:bg-white outline-none focus:border-[#7C3AED]/20 w-64 transition-all duration-300 placeholder:text-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="h-8 w-[1px] bg-gray-100 mx-1" />

            {/* Filter button */}
            <button
              onClick={() => setFilterOpen(p => !p)}
              className={`flex items-center gap-2 h-11 px-5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 relative active:scale-95 ${
                activeFilterCount > 0 
                  ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-200' 
                  : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-[#7C3AED]'
              }`}
            >
              <LayoutGrid size={16} />
              Filter 
              {activeFilterCount > 0 && (
                <span className="bg-white text-[#7C3AED] w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ml-1 shadow-sm animate-in zoom-in">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort button + dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(p => !p)}
                className="flex items-center gap-2 h-11 px-5 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider text-gray-500 hover:bg-gray-50 hover:text-[#7C3AED] transition-all duration-300 active:scale-95"
              >
                <ChevronDown size={16} className={`transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`} />
                Sort: <span className="text-gray-900 lowercase font-medium ml-0.5">{currentSortLabel}</span>
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                  <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-[#E2E0EC] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-50 w-52 overflow-hidden py-1">
                    {SORT_OPTIONS.map(opt => {
                      const active = opt.value === `${sortBy}-${sortOrder}`;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => {
                            const [by, ord] = opt.value.split('-');
                            setSortBy(by as any);
                            setSortOrder(ord as any);
                            setSortOpen(false);
                          }}
                          className={`px-4 py-2.5 text-[13px] cursor-pointer flex items-center gap-3 transition-colors ${
                            active ? 'bg-[#FAF8FF] text-[#7C3AED] font-bold' : 'text-[#5A5680] font-medium hover:bg-[#F5F4F8] hover:text-[#1A1730]'
                          }`}
                        >
                          <span className="w-3 shrink-0">{active ? '✓' : ''}</span>
                          {opt.label}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-6 bg-[#E2E0EC] mx-1" />

            {/* Resource count */}
            <span className="text-[13px] font-medium text-[#9B97B8] min-w-[70px]">
              {loading ? '…' : `${sortedDisplayed.length} resources`}
            </span>

            {/* View toggle */}
            <div className="flex bg-[#F5F4F8] border border-[#E2E0EC] rounded-[10px] p-[3px] gap-1 ml-1">
              {(['Grid','List','Map'] as const).map(v => (
                <button 
                  key={v} 
                  onClick={() => setView(v)} 
                  className={`px-3.5 py-1 text-[12px] font-bold rounded-[7px] transition-all ${
                    v === view 
                      ? 'bg-white text-[#7C3AED] shadow-[0_1px_4px_rgba(0,0,0,0.06)]' 
                      : 'text-[#9B97B8] hover:text-[#5A5680]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {isAdminUser && (
              <button 
                onClick={() => navigate('/admin/resources')} 
                className="ml-2 flex items-center gap-2 h-9 px-4 bg-[#7C3AED] text-white rounded-[10px] text-[13px] font-bold shadow-[0_4px_14px_rgba(124,58,237,0.25)] hover:bg-[#6D28D9] hover:-translate-y-[1px] transition-all"
              >
                + Add
              </button>
            )}
          </div>
        </div>

        {/* Content area (flex row: filter sidebar + main) */}
        <div style={{ flex:1, position:'relative', display:'flex', minWidth:0 }}>

          {/* Filter backdrop */}
          {filterOpen && (
            <div
              style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.2)',zIndex:40 }}
              onClick={() => setFilterOpen(false)}
            />
          )}

          {/* Slide-in filter sidebar */}
          <div style={{
            position:'fixed', top:56, bottom:0, left:0,
            width:280, background:'white', borderRight:'1px solid #E2E0EC',
            zIndex:50, overflowY:'auto', padding:'20px 16px',
            transform: filterOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: filterOpen ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
          }}>
            {/* Sidebar header */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <p style={{ fontSize:15,fontWeight:600,color:'#1A1730',margin:0 }}>Filters</p>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setTypeFilter(''); setStatusFilter(''); setDayFilter(''); setMinCapacity(''); }}
                    style={{ fontSize:11,color:'#7C3AED',background:'none',border:'none',cursor:'pointer',fontWeight:500 }}
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setFilterOpen(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'#9B97B8',display:'flex',alignItems:'center',padding:4 }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Type */}
            <p style={{ fontSize:10,color:'#9B97B8',margin:'0 0 8px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em' }}>Type</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:18 }}>
              <Chip active={typeFilter===''} onClick={()=>setTypeFilter('')}>All</Chip>
              {ALL_TYPES.map(t => <Chip key={t} active={typeFilter===t} onClick={()=>setTypeFilter(typeFilter===t?'':t)}>{T[t].label}</Chip>)}
            </div>
            <div style={{ height:1,background:'#E2E0EC',margin:'0 0 18px' }} />

            {/* Status */}
            <p style={{ fontSize:10,color:'#9B97B8',margin:'0 0 8px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em' }}>Status</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:18 }}>
              <Chip active={statusFilter===''} onClick={()=>setStatusFilter('')}>All</Chip>
              {ALL_ST.map(s => <Chip key={s} active={statusFilter===s} onClick={()=>setStatusFilter(statusFilter===s?'':s)}>{S[s].label}</Chip>)}
            </div>
            <div style={{ height:1,background:'#E2E0EC',margin:'0 0 18px' }} />

            {/* Day Available */}
            <p style={{ fontSize:10,color:'#9B97B8',margin:'0 0 8px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em' }}>Day Available</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:18 }}>
              <Chip active={dayFilter===''} onClick={()=>setDayFilter('')}>Any</Chip>
              {ALL_DAYS.map(d => <Chip key={d} active={dayFilter===d} onClick={()=>setDayFilter(dayFilter===d?'':d)}>{DAY_S[d]}</Chip>)}
            </div>
            <div style={{ height:1,background:'#E2E0EC',margin:'0 0 18px' }} />

            {/* Min Capacity */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <p style={{ fontSize:10,color:'#9B97B8',margin:0,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em' }}>Min Capacity</p>
              <span style={{ fontSize:12, fontWeight:700, color:'#7C3AED' }}>{minCapacity === '' ? 0 : minCapacity}+</span>
            </div>
            <div style={{ marginBottom:18 }}>
              <input 
                type="range"
                min="0"
                max={maxCap}
                step="1"
                value={minCapacity === '' ? 0 : minCapacity}
                onChange={(e) => setMinCapacity(e.target.value === '0' ? '' : parseInt(e.target.value))}
                style={{ 
                  width:'100%', accentColor:'#7C3AED', cursor:'pointer'
                }}
              />
              <p style={{ fontSize:10, color:'#9B97B8', marginTop:6 }}>Only show resources that can accommodate at least this many people.</p>
            </div>
            <div style={{ height:1,background:'#E2E0EC',margin:'0 0 18px' }} />

            {/* Quick stats */}
            <div style={{ background:'#F5F4F8',borderRadius:12,padding:14 }}>
              <p style={{ fontSize:10,fontWeight:600,color:'#5A5680',margin:'0 0 10px',textTransform:'uppercase',letterSpacing:'0.08em' }}>Quick Stats</p>
              {[
                { label:'Available now',  count:counts.active, color:'#15803d' },
                { label:'Booked today',   count:0,             color:'#b45309' },
                { label:'Out of service', count:counts.oos,    color:'#dc2626' },
              ].map(q => (
                <div key={q.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                  <span style={{ fontSize:12,color:'#5A5680' }}>{q.label}</span>
                  <span style={{ fontSize:13,fontWeight:800,color:q.color,fontFamily:'monospace' }}>{q.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex:1, padding:'16px 18px', minWidth:0, overflowY:'auto' }}>
            {/* Top Tabs */}
            <div className="flex items-center gap-8 border-b border-[#E2E0EC] mb-8 overflow-x-auto pt-2">
              {[
                { id: 'ALL', label: 'All Resources', count: tabCounts.ALL },
                { id: 'LECTURE_HALL', label: 'Lecture Halls', count: tabCounts.LECTURE_HALL },
                { id: 'LAB', label: 'Labs', count: tabCounts.LAB },
                { id: 'MEETING_ROOM', label: 'Meeting Rooms', count: tabCounts.MEETING_ROOM },
                { id: 'EQUIPMENT', label: 'Equipment', count: tabCounts.EQUIPMENT },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 pb-4 border-b-[3px] font-semibold text-[15px] transition-all whitespace-nowrap px-2 relative top-[1px] ${
                      isActive 
                        ? 'border-[#7C3AED] text-[#7C3AED]' 
                        : 'border-transparent text-[#9B97B8] hover:text-[#5A5680] hover:border-[#E2E0EC]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                      isActive 
                        ? 'bg-[#F3E8FF] text-[#7C3AED]' 
                        : 'bg-[#F5F4F8] text-[#9B97B8]'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-4 gap-5 mb-8">
              <StatCard label="TOTAL RESOURCES" value={counts.total} color="#7C3AED" icon={Layers} />
              <StatCard label="ACTIVE" value={counts.active} color="#059669" icon={CheckCircle2} />
              <StatCard label="MAINTENANCE" value={counts.maint} color="#D97706" icon={Settings} />
              <StatCard label="OUT OF SERVICE" value={counts.oos} color="#DC2626" icon={AlertCircle} />
            </div>

            {/* Card grid / List / Map */}
            {loading ? (
              <div style={{ display:'flex',justifyContent:'center',paddingTop:80 }}>
                <div className="ch-spin" style={{ width:32,height:32,border:'3px solid #E2E0EC',borderTopColor:'#7C3AED',borderRadius:'50%' }} />
              </div>
            ) : sortedDisplayed.length === 0 ? (
              <div style={{ textAlign:'center',padding:'80px 24px' }}>
                <Search size={36} color="#C4C0DA" style={{ margin:'0 auto 12px' }} />
                <p style={{ fontSize:16,fontWeight:600,color:'#1A1730',margin:'0 0 4px' }}>No resources found</p>
                <p style={{ fontSize:13,color:'#9B97B8',margin:0 }}>Try adjusting your filters or search</p>
              </div>
            ) : view === 'Grid' ? (
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }}>
                {sortedDisplayed.map((r, idx) => (
                  <ResourceCard key={r.id} resource={r} index={idx} onClick={() => setSelected(r)} />
                ))}
              </div>
            ) : view === 'List' ? (
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {sortedDisplayed.map((r, idx) => (
                  <ResourceListItem key={r.id} resource={r} index={idx} onClick={() => setSelected(r)} />
                ))}
              </div>
            ) : (
              <FloorMap 
                resources={sortedDisplayed}
                onSelectResource={setSelected}
                selectedResource={selected}
              />
            )}
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && <DetailDrawer resource={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ── Resource Card ── */
function ResourceCard({ resource, index, onClick }: { resource: Resource; index: number; onClick: () => void }) {
  const tc = T[resource.type];
  const sc = S[resource.status];
  const avail = resource.availabilityWindows?.length > 0 ? Math.min(100, (resource.availabilityWindows.length / 7) * 100) : 0;
  const barColor = avail > 60 ? '#22c55e' : avail > 30 ? '#f59e0b' : '#ef4444';

  const Icon = tc.Icon;

  return (
    <div
      className="ch-card-in group flex flex-col cursor-pointer bg-white border border-[#E2E0EC] rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED] hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)]"
      onClick={onClick}
      style={{ animationDelay:`${Math.min(index,10)*0.04}s` }}
    >
      {/* Gradient photo area */}
      <div style={{ height:144, background: resource.imageUrl ? 'transparent' : tc.grad, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
          {resource.imageUrl ? (
            <img src={resource.imageUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt={resource.name} />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background: tc.grad }}>
              <Icon size={32} color="rgba(255,255,255,0.9)" />
            </div>
          )}
        </div>
        {/* type badge */}
        <span style={{ position:'absolute',top:8,left:8,background:'rgba(0,0,0,0.35)',backdropFilter:'blur(4px)',color:'white',fontSize:9,padding:'3px 8px',borderRadius:999,fontWeight:500,zIndex:10 }}>
          {tc.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding:'10px 12px 12px' }}>
        <p style={{ fontSize:13,fontWeight:600,color:'#1A1730',margin:'0 0 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{resource.name}</p>
        {resource.location && (
          <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#9B97B8',marginBottom:6 }}>
            <MapPin size={10} />{resource.location}
          </div>
        )}

        {/* Footer row */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
          <span style={{ fontSize:10,padding:'2px 8px',borderRadius:999,border:`1px solid ${sc.dot}33`,background:sc.bg,color:sc.text,fontWeight:500 }}>
            {sc.label}
          </span>
          {resource.capacity != null && (
            <span style={{ fontSize:11,color:'#5A5680',display:'flex',alignItems:'center',gap:3 }}>
              <Users size={10}/>{resource.capacity}
            </span>
          )}
        </div>

        {/* Availability bar */}
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
            <span style={{ fontSize:10,color:'#9B97B8' }}>Availability today</span>
            <span style={{ fontSize:10,color:barColor,fontWeight:600 }}>{Math.round(avail)}%</span>
          </div>
          <div style={{ height:3,background:'#E2E0EC',borderRadius:99 }}>
            <div style={{ height:3,borderRadius:99,background:barColor,width:`${avail}%`,transition:'width .3s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Drawer ── */
function DetailDrawer({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const tc = T[resource.type];
  const sc = S[resource.status];
  const sorted = [...(resource.availabilityWindows||[])].sort((a,b) =>
    ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].indexOf(a.dayOfWeek) -
    ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].indexOf(b.dayOfWeek)
  );

  const Icon = tc.Icon;

  return (
    <div style={{ position:'fixed',inset:0,zIndex:50 }} onClick={onClose}>
      {/* backdrop */}
      <div className="ch-fade-in" style={{ position:'absolute',inset:0,background:'rgba(26,23,48,0.45)',backdropFilter:'blur(4px)' }} />

      {/* panel */}
      <div
        className="ch-slide-in"
        style={{ position:'absolute',right:0,top:0,bottom:0,width:320,background:'white',display:'flex',flexDirection:'column',overflowY:'auto',boxShadow:'-10px 0 50px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div style={{ height:160,background:resource.imageUrl ? 'transparent' : tc.grad,position:'relative',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 16px' }}>
          {resource.imageUrl ? (
            <div style={{ position:'absolute', inset:0 }}>
              <img src={resource.imageUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
            </div>
          ) : (
            <div style={{ position:'absolute',bottom:0,left:0,right:0,height:60,background:'linear-gradient(to top, white, transparent)' }} />
          )}
          <button onClick={onClose} style={{ position:'absolute',top:10,right:10,width:30,height:30,borderRadius:8,background:'rgba(0,0,0,0.3)',backdropFilter:'blur(4px)',border:'none',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10 }}>
            <X size={14} />
          </button>
          {resource.imageUrl ? (
            <div style={{ position:'absolute',bottom:12,left:16,zIndex:5,display:'flex',flexDirection:'column',alignItems:'flex-start' }}>
              <p style={{ fontSize:16,fontWeight:700,color:'white',margin:0 }}>{resource.name}</p>
              <p style={{ fontSize:11,color:'white',margin:0,marginTop:2,opacity:0.9 }}>{tc.label}</p>
            </div>
          ) : (
            <div style={{ position:'relative',zIndex:5,display:'flex',flexDirection:'column',alignItems:'center' }}>
              <Icon size={32} color="rgba(255,255,255,0.9)" />
              <div style={{ textAlign:'center',marginTop:10 }}>
                <p style={{ fontSize:16,fontWeight:700,color:'#1A1730',margin:0 }}>{resource.name}</p>
                <p style={{ fontSize:11,color:'#5A5680',margin:0,marginTop:2 }}>{tc.label}</p>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex:1,padding:'14px 16px',overflowY:'auto' }}>
          {/* Status */}
          <div style={{ display:'inline-flex',alignItems:'center',gap:5,background:sc.bg,color:sc.text,borderRadius:999,padding:'4px 10px',fontSize:11,fontWeight:600,marginBottom:14 }}>
            <div style={{ width:6,height:6,borderRadius:'50%',background:sc.dot }} />
            {sc.label}
          </div>

          {/* Details 2×2 */}
          <p style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',color:'#9B97B8',fontWeight:600,margin:'0 0 8px' }}>DETAILS</p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:14 }}>
            {[
              { label:'Capacity', value: resource.capacity ? `${resource.capacity} pax` : '—' },
              { label:'Location', value: resource.location || '—' },
              { label:'Type',     value: tc.label },
              { label:'Status',   value: sc.label },
            ].map(m => (
              <div key={m.label} style={{ background: 'rgba(124, 58, 237, 0.03)', border: '1px solid rgba(124, 58, 237, 0.1)', borderRadius: 10, padding: '8px 10px' }}>
                <p style={{ fontSize:9,color:'#9B97B8',textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 3px',fontWeight:600 }}>{m.label}</p>
                <p style={{ fontSize:12,fontWeight:600,color:'#1A1730',margin:0 }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Schedule */}
          {sorted.length > 0 && (
            <>
              <p style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',color:'#9B97B8',fontWeight:600,margin:'0 0 8px' }}>WEEKLY SCHEDULE</p>
              <div style={{ display:'flex',flexDirection:'column',gap:5,marginBottom:14 }}>
                {sorted.map((w,i) => {
                  const dur = calcDur(w.startTime, w.endTime);
                  return (
                    <div key={i} style={{ 
                      display:'flex',
                      alignItems:'center',
                      gap:8,
                      padding:'8px 12px',
                      background: 'rgba(124,58,237,0.05)',
                      borderRadius:10,
                      border: '1px solid rgba(124,58,237,0.15)',
                      transition: 'all 0.2s ease'
                    }}>
                      <span style={{ 
                        background:'#7c3aed',
                        color:'white',
                        fontSize:10,
                        fontFamily:'monospace',
                        fontWeight:800,
                        padding:'2px 8px',
                        borderRadius:6,
                        width:36,
                        textAlign:'center',
                        flexShrink:0 
                      }}>
                        {DAY_S[w.dayOfWeek]}
                      </span>
                      <Clock size={11} color="#7c3aed" style={{ flexShrink:0 }} />
                      <span style={{ fontSize:12, color:'#7c3aed', flex:1, fontFamily:'monospace', fontWeight:500 }}>
                        {w.startTime} – {w.endTime}
                      </span>
                      {dur && (
                        <span style={{ 
                          fontSize:10, 
                          color:'#9B97B8', 
                          fontFamily:'monospace',
                          background: 'white',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 500
                        }}>
                          {dur}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Description */}
          {resource.description && (
            <>
              <p style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',color:'#9B97B8',fontWeight:600,margin:'0 0 6px' }}>DESCRIPTION</p>
              <p style={{ fontSize:12,color:'#5A5680',lineHeight:1.6,margin:0 }}>{resource.description}</p>
            </>
          )}

          <div style={{ borderTop: '1px solid #E2E0EC', paddingTop: 16, marginTop: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#9B97B8', 
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
              Quick Access
            </p>
            <div style={{ background: '#F5F4F8', borderRadius: 12, padding: 16,
              display: 'flex', alignItems: 'center', gap: 16 }}>
              
              <div id={`qr-${resource.id}`} style={{ background: 'white', padding: 8, borderRadius: 8,
                border: '1px solid #E2E0EC' }}>
                <QRCodeSVG
                  value={`${window.location.origin}/resources/${resource.id}`}
                  size={72}
                  fgColor="#1A1730"
                  bgColor="white"
                  level="M"
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1730', margin: 0 }}>
                  Scan to access
                </p>
                <p style={{ fontSize: 10, color: '#9B97B8', margin: '3px 0 8px' }}>
                  Opens this resource on any device. Print and place on room door.
                </p>
                <div style={{ fontSize: 10, color: '#7C3AED', 
                  fontFamily: 'DM Mono, monospace', background: '#F0EBFF',
                  padding: '3px 8px', borderRadius: 6, display: 'inline-block',
                  border: '1px solid rgba(124,58,237,0.2)' }}>
                  {resource.name} · {tc.label}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {/* Print button */}
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank')
                  printWindow?.document.write(`
                    <html><head><title>QR - ${resource.name}</title>
                    <style>
                      body { font-family: sans-serif; display: flex; flex-direction: column; 
                             align-items: center; justify-content: center; height: 100vh; margin: 0; }
                      h2 { font-size: 18px; margin-bottom: 4px; }
                      p { font-size: 13px; color: #666; margin: 0 0 16px; }
                      svg { width: 160px; height: 160px; }
                    </style></head>
                    <body>
                      <h2>${resource.name}</h2>
                      <p>${tc.label} · ${resource.location || ''}</p>
                      ${document.getElementById(`qr-${resource.id}`)?.innerHTML}
                      <p style="margin-top:12px;font-size:11px;color:#999;">Scan to book this resource</p>
                    </body></html>
                  `)
                  printWindow?.document.close()
                  printWindow?.print()
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
                  e.currentTarget.style.color = '#7C3AED';
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#1A1730';
                  e.currentTarget.style.borderColor = '#E2E0EC';
                }}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid #E2E0EC',
                  background: 'white', fontSize: 12, color: '#1A1730', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s ease' }}>
                🖨️ Print QR
              </button>

              {/* Copy link button */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/resources/${resource.id}`
                  navigator.clipboard.writeText(url)
                  toast.success('Link copied to clipboard!')
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
                  e.currentTarget.style.color = '#7C3AED';
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#1A1730';
                  e.currentTarget.style.borderColor = '#E2E0EC';
                }}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid #E2E0EC',
                  background: 'white', fontSize: 12, color: '#1A1730', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s ease' }}>
                🔗 Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding:'12px 16px',borderTop:'1px solid #E2E0EC',display:'flex',flexDirection:'column',gap:7 }}>
          <button 
            style={{ width:'100%',padding:'12px 0',background:'#7C3AED',color:'white',border:'none',borderRadius:12,fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
          >
            Request Booking
          </button>
          <button style={{ width:'100%',padding:'8px 0',background:'white',color:'#1A1730',border:'1px solid #E2E0EC',borderRadius:12,fontSize:13,cursor:'pointer' }}>
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Resource List Item ── */
function ResourceListItem({ resource, index, onClick }: { resource: Resource; index: number; onClick: () => void }) {
  const tc = T[resource.type];
  const sc = S[resource.status];
  const avail = resource.availabilityWindows?.length > 0 ? Math.min(100, (resource.availabilityWindows.length / 7) * 100) : 0;
  const barColor = avail > 60 ? '#22c55e' : avail > 30 ? '#f59e0b' : '#ef4444';

  const Icon = tc.Icon;

  return (
    <div
      className="ch-card-in"
      onClick={onClick}
      style={{
        background:'white', border:'1.5px solid #E2E0EC', borderRadius:12, overflow:'hidden',
        cursor:'pointer', transition:'all .2s', animationDelay:`${Math.min(index,10)*0.04}s`,
        display:'flex', alignItems:'center', padding:12, gap:16
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor='#a855f7'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 8px 30px rgba(124,58,237,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor='#E2E0EC'; (e.currentTarget as HTMLDivElement).style.boxShadow='none'; }}
    >
      <div style={{ width:60, height:60, borderRadius:8, background: resource.imageUrl ? 'transparent' : tc.grad, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
        {resource.imageUrl ? (
          <img src={resource.imageUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt={resource.name} />
        ) : (
          <Icon size={24} color="rgba(255,255,255,0.9)" />
        )}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14,fontWeight:600,color:'#1A1730',margin:'0 0 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{resource.name}</p>
        {resource.location && (
          <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,color:'#9B97B8' }}>
            <MapPin size={12} />{resource.location}
          </div>
        )}
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end',flexShrink:0,width:120 }}>
        <span style={{ fontSize:10,padding:'2px 8px',borderRadius:999,border:`1px solid ${sc.dot}33`,background:sc.bg,color:sc.text,fontWeight:600 }}>
          {sc.label}
        </span>
        <span style={{ fontSize:11,color:'#9B97B8',display:'flex',alignItems:'center',gap:4 }}>
          <Users size={12}/>Capacity: {resource.capacity ?? '—'}
        </span>
      </div>

      <div style={{ width:120, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5, width:'100%' }}>
          <span style={{ fontSize:11,color:'#9B97B8' }}>Availability</span>
          <span style={{ fontSize:11,color:barColor,fontWeight:600 }}>{Math.round(avail)}%</span>
        </div>
        <div style={{ height:4,background:'#E2E0EC',borderRadius:99, width:'100%' }}>
          <div style={{ height:4,borderRadius:99,background:barColor,width:`${avail}%`,transition:'width .3s' }} />
        </div>
      </div>
      
      <ChevronRight size={20} color="#C4C0DA" style={{ marginLeft:4 }} />
    </div>
  );
}
