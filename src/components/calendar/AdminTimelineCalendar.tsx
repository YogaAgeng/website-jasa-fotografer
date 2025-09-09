/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Users, MapPin, BadgeCheck, Plus } from "lucide-react";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import CreateBookingPanel from "./CreateBookingPanel";
import EditBookingPanel from "./EditBookingPanel";
import { BookingAPI } from "../../api/client";
import { StaffAPI } from "../../api/client";
import Button from "../ui/Button";

/**
 * Admin Timeline Calendar – Week View
 * -------------------------------------------------------------
 * - Staff-managed lanes (no crew login). Staff = PHOTOGRAPHER / EDITOR
 * - 7-day grid (Mon–Sun), vertical timeline (07:00–19:00)
 * - Drag a booking to another day / time / staff lane
 * - Colors reflect booking status
 * - Minimal, production-ready structure with TailwindCSS
 * - Replace mock API handlers with your real endpoints
 */

// ----------------------------- Types
type StaffType = "PHOTOGRAPHER" | "EDITOR";

type Staff = {
  id: string;
  name: string;
  staffType: StaffType;
  color?: string; // optional accent color for lane header
};

type BookingStatus =
  | "INQUIRY"
  | "HOLD"
  | "CONFIRMED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "EDITING"
  | "REVIEW"
  | "DELIVERED"
  | "CLOSED"
  | "CANCELLED"
  | "EXPIRED";

type Booking = {
  id: string;
  title: string;
  clientName: string;
  location?: string;
  staffId: string; // assigned staff for shooting (for EDITING, you can assign EDITOR staff)
  start: string; // ISO string in UTC
  end: string;   // ISO string in UTC
  status: BookingStatus;
};

// ----------------------------- Utilities

const TZ_OFFSET_MIN = new Date().getTimezoneOffset(); // minutes vs local; we store UTC

function toDate(iso: string) { return new Date(iso); }
function clone(d: Date) { return new Date(d.getTime()); }
function stripTime(d: Date) { const c = clone(d); c.setUTCHours(0, 0, 0, 0); return c; }
function addDays(d: Date, n: number) { const c = clone(d); c.setUTCDate(c.getUTCDate() + n); return c; }
function addMinutes(d: Date, n: number) { const c = clone(d); c.setUTCMinutes(c.getUTCMinutes() + n); return c; }
function diffMinutes(a: Date, b: Date) { return Math.round((a.getTime() - b.getTime()) / 60000); }
function setTimeUTC(d: Date, h: number, m = 0) { const c = clone(d); c.setUTCHours(h, m, 0, 0); return c; }

function startOfWeekUTC(d: Date) { // Monday as start
  const c = stripTime(d);
  const dow = c.getUTCDay(); // 0 Sun, 1 Mon
  const diff = (dow === 0 ? -6 : 1 - dow); // move to Monday
  return addDays(c, diff);
}

function formatHM(d: Date) {
  // show time in local (Asia/Jakarta UI expectations); keep simple 24h
  const local = new Date(d.getTime() - TZ_OFFSET_MIN * 60000);
  const hh = local.getHours().toString().padStart(2, "0");
  const mm = local.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function fmtDayLabel(d: Date) {
  const local = new Date(d.getTime() - TZ_OFFSET_MIN * 60000);
  const wd = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][local.getDay()];
  const day = local.getDate();
  return `${wd} ${day}`;
}

// Status → Tailwind color classes
const STATUS_COLOR: Record<BookingStatus, string> = {
  INQUIRY: "bg-slate-300 text-slate-900",
  HOLD: "bg-amber-300 text-amber-900",
  CONFIRMED: "bg-emerald-400 text-emerald-950",
  SCHEDULED: "bg-sky-400 text-sky-950",
  IN_PROGRESS: "bg-violet-400 text-violet-950",
  EDITING: "bg-orange-300 text-orange-950",
  REVIEW: "bg-teal-300 text-teal-950",
  DELIVERED: "bg-zinc-300 text-zinc-900",
  CLOSED: "bg-zinc-400 text-zinc-900",
  CANCELLED: "bg-rose-300 text-rose-950",
  EXPIRED: "bg-rose-200 text-rose-900",
};

// ----------------------------- Mock Data (replace with API)

// no demo staff

// demo baseline removed

// demo data removed; all bookings are loaded from API

// ----------------------------- DnD wrappers

function DraggableBooking({
  booking,
  pxPerMin,
  dayStartUTC,
  onChangeStatus,
  positioning,
}: {
  booking: Booking;
  pxPerMin: number;
  dayStartUTC: Date;
  onChangeStatus?: (id: string, status: BookingStatus) => void;
  positioning?: { width: number; left: number; zIndex: number };
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: booking.id,
    data: { booking },
  });

  const start = toDate(booking.start);
  const end = toDate(booking.end);
  const top = Math.max(0, diffMinutes(start, dayStartUTC)) * pxPerMin; // minutes from 07:00 UTC baseline
  const height = Math.max(32, Math.max(15, diffMinutes(end, start)) * pxPerMin);

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    top,
    height,
    width: positioning ? `${positioning.width}%` : '95%',
    left: positioning ? `${positioning.left}%` : '2.5%',
    zIndex: isDragging ? 1000 : (positioning?.zIndex || 10),
  };

  const color = STATUS_COLOR[booking.status];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`absolute rounded-xl shadow-sm border border-black/5 p-2 text-[11px] ${color} ${isDragging ? "opacity-80 ring-2 ring-black/10" : ""}`}
      style={style}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold truncate">{booking.title}</span>
        <span className="shrink-0 text-[10px] font-medium">
          {formatHM(start)}–{formatHM(end)}
        </span>
      </div>
      <div className="mt-1">
        <select
          className="text-[10px] px-1 py-0.5 rounded border bg-white/80"
          value={booking.status}
          onChange={(e) => onChangeStatus?.(booking.id, e.target.value as BookingStatus)}
          onClick={(e) => e.stopPropagation()}
        >
          {Object.keys(STATUS_COLOR).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 mt-1 opacity-80">
        <Users className="w-3 h-3" />
        <span className="truncate">{booking.clientName}</span>
      </div>
      {booking.location && (
        <div className="flex items-center gap-2 mt-1 opacity-80">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{booking.location}</span>
        </div>
      )}
    </div>
  );
}

function DroppableLane({ laneId, children }: { laneId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: laneId });
  return (
    <div ref={setNodeRef} className={`relative h-full ${isOver ? "bg-black/5" : ""}`}>
      {children}
    </div>
  );
}

// ----------------------------- Main Component

export default function AdminTimelineCalendar() {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeekUTC(new Date()));
  const [pxPerMin, setPxPerMin] = useState<number>(1.2); // zoom: pixel per minute
  const [staffFilter, setStaffFilter] = useState<StaffType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [query, setQuery] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  // Data state (would come from API in real app)
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const hours = { start: 7, end: 19 }; // 07:00–19:00 local WIB (but we draw using UTC baseline)
  const columnHeight = (hours.end - hours.start) * 60 * pxPerMin; // minutes * pxPerMin

  // Build days for the selected week
  const daysUTC = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  // Load staff from API only
  React.useEffect(() => {
    (async () => {
      try {
        const data = await StaffAPI.list();
        if (Array.isArray(data) && data.length) {
          const apiStaff = data.map((s: any) => ({ id: s.id, name: s.name, staffType: s.staffType }));
          setStaff(apiStaff);
        }
      } catch {}
    })();
  }, []);

  // Load bookings from API (READ). Fallback fields jika API tidak lengkap
  React.useEffect(() => {
    (async () => {
      try {
        const data = await BookingAPI.list();
        if (Array.isArray(data) && data.length) {
          setBookings(
            data.map((b: any, idx: number) => {
              const assignedStaffId = b.staffId && staff.find(s => s.id === b.staffId) ? b.staffId : (staff[0]?.id || "");
              return {
                id: b.id,
                title: b.title || b.clientName || `Booking ${idx+1}`,
                clientName: b.clientName || "Client",
                location: b.location || undefined,
                staffId: assignedStaffId,
                start: b.start,
                end: b.end,
                status: (b.status || "CONFIRMED") as BookingStatus,
              };
            })
          );
        } else {
          setBookings([]);
        }
      } catch {
        setBookings([]);
      }
    })();
  }, [staff]);

  // Lane id generator: staffId__dayIndex
  const laneId = (staffId: string, dayIndex: number) => `${staffId}__${dayIndex}`;

  // Day start (UTC) baseline for vertical placement: set to 07:00 local (== 00:00 UTC + 7h)
  function dayStartUTCWithHour(dUTC: Date) { return setTimeUTC(dUTC, hours.start + 0, 0); }

  // Filter staff list
  const filteredStaff = useMemo(
    () => (staffFilter === "ALL" ? staff : staff.filter((s) => s.staffType === staffFilter)),
    [staff, staffFilter]
  );

  // Filter bookings by status
  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = statusFilter === "ALL" ? bookings : bookings.filter(b => b.status === statusFilter);
    if (!q) return base;
    return base.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.clientName.toLowerCase().includes(q) ||
      (b.location || "").toLowerCase().includes(q)
    );
  }, [bookings, statusFilter, query]);

  // Results inside current visible week
  const weekResults = useMemo(() => {
    return filteredBookings.filter((b) => {
      const d = toDate(b.start);
      const di = Math.floor((stripTime(d).getTime() - stripTime(weekStart).getTime()) / 86400000);
      return di >= 0 && di < 7;
    });
  }, [filteredBookings, weekStart]);

  // Results outside current week (only shown when searchAllTime)
  // Auto-jump: bila ada query dan minggu aktif tidak punya hasil, lompat ke minggu match pertama
  React.useEffect(() => {
    if (!query.trim()) return;
    if (weekResults.length > 0) return;
    if (filteredBookings.length === 0) return;
    const first = filteredBookings[0];
    const target = startOfWeekUTC(toDate(first.start));
    // Hanya ubah jika target minggu berbeda
    if (stripTime(target).getTime() !== stripTime(weekStart).getTime()) {
      setWeekStart(target);
    }
  }, [query, filteredBookings, weekResults.length]);

  const dayCounts = useMemo(() => {
    const counts = Array.from({ length: 7 }, () => 0);
    for (const b of weekResults) {
      const d = toDate(b.start);
      const di = Math.floor((stripTime(d).getTime() - stripTime(weekStart).getTime()) / 86400000);
      if (di >= 0 && di < 7) counts[di] += 1;
    }
    return counts;
  }, [weekResults, weekStart]);

  //

  // Map bookings grouped by staffId & dayIndex, sorted by start time
  const bookingsByLane = useMemo(() => {
    const m = new Map<string, Booking[]>();
    for (const b of filteredBookings) {
      const d = toDate(b.start);
      const di = Math.floor((stripTime(d).getTime() - stripTime(weekStart).getTime()) / 86400000);
      if (di < 0 || di > 6) continue; // out of visible range
      const key = laneId(b.staffId, di);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(b);
    }
    
    // Sort bookings within each lane by start time
    for (const [, bookings] of m.entries()) {
      bookings.sort((a, b) => {
        const timeA = toDate(a.start).getTime();
        const timeB = toDate(b.start).getTime();
        return timeA - timeB;
      });
    }
    
    return m;
  }, [filteredBookings, weekStart]);

  // Function to detect overlapping events and calculate positioning
  const getEventPositioning = (bookings: Booking[]) => {
    const positionedEvents: Array<Booking & { width: number; left: number; zIndex: number }> = [];
    
    for (let i = 0; i < bookings.length; i++) {
      const current = bookings[i];
      const currentStart = toDate(current.start).getTime();
      const currentEnd = toDate(current.end).getTime();
      
      // Find overlapping events
      const overlapping = positionedEvents.filter(event => {
        const eventStart = toDate(event.start).getTime();
        const eventEnd = toDate(event.end).getTime();
        return !(currentEnd <= eventStart || currentStart >= eventEnd);
      });
      
      // Calculate width and position based on overlaps
      const totalOverlaps = overlapping.length + 1;
      const width = 95 / totalOverlaps; // Divide width among overlapping events
      const left = 2.5 + (overlapping.length * width); // Position based on overlap index
      
      positionedEvents.push({
        ...current,
        width,
        left,
        zIndex: 10 + i
      });
    }
    
    return positionedEvents;
  };

  // Handle drag end → compute new staff/day and approximate time by deltaY
  function onDragEnd(e: DragEndEvent) {
    const overId = e.over?.id as string | undefined;
    const drag = e.active?.data?.current as { booking?: Booking } | undefined;
    if (!overId || !drag?.booking) return;

    const [newStaffId, dayIndexStr] = overId.split("__");
    const dayIndex = parseInt(dayIndexStr, 10);
    const original = drag.booking;

    // Duration in minutes
    const start = toDate(original.start);
    const end = toDate(original.end);
    const durMin = Math.max(15, diffMinutes(end, start));

    // Convert deltaY to minutes (snap 30m)
    const deltaY = e.delta.y; // pixels
    const deltaMinRaw = Math.round(deltaY / pxPerMin);
    const snap = 30; // minutes step
    const deltaMin = Math.round(deltaMinRaw / snap) * snap;

    // New start baseline: 07:00 UTC at target day
    const dayUTC = addDays(weekStart, dayIndex);
    const base = dayStartUTCWithHour(dayUTC);

    // Compute new start minutes relative to base
    const startMinutesFromBase = Math.max(0, diffMinutes(start, dayStartUTCWithHour(stripTime(start))));
    const newStart = addMinutes(base, Math.max(0, startMinutesFromBase + deltaMin));
    const newEnd = addMinutes(newStart, durMin);

    // Apply update
    setBookings((prev) =>
      prev.map((b) =>
        b.id === original.id
          ? {
              ...b,
              staffId: newStaffId,
              start: newStart.toISOString(),
              end: newEnd.toISOString(),
              status: b.status === "HOLD" ? "CONFIRMED" : b.status, // example: auto-confirm on move
            }
          : b
      )
    );
  }

  async function handleChangeStatus(id: string, status: BookingStatus) {
    try {
      await BookingAPI.updateStatus(id, status);
      await BookingAPI.update(id, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch {
      // ignore simple error
    }
  }

  // Navigation
  function prevWeek() { setWeekStart(addDays(weekStart, -7)); }
  function nextWeek() { setWeekStart(addDays(weekStart, 7)); }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 bg-white shadow border hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button onClick={nextWeek} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 bg-white shadow border hover:bg-slate-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 bg-white shadow border">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Zoom</span>
            <input
              type="range" min={0.8} max={2} step={0.1}
              value={pxPerMin}
              onChange={(e) => setPxPerMin(parseFloat(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white shadow border">
            <Users className="w-4 h-4" />
            <select
              className="text-sm outline-none bg-transparent"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value as any)}
            >
              <option value="ALL">All Staff</option>
              <option value="PHOTOGRAPHER">Photographers</option>
              <option value="EDITOR">Editors</option>
            </select>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateOpen(true)}
          >
            New Booking
          </Button>
          {/* Add Block removed */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white shadow border">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul / client / lokasi"
              className="text-sm outline-none bg-transparent w-56"
            />
          </div>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Filter by Status:</div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-2 rounded-md border font-medium transition-all ${
              statusFilter === "ALL" 
                ? "bg-gray-800 text-white border-gray-800 shadow-md" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            All Status
          </button>
          {Object.entries(STATUS_COLOR).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setStatusFilter(k as BookingStatus)}
              className={`px-3 py-2 rounded-md border font-medium transition-all cursor-pointer ${
                statusFilter === k 
                  ? `${v} shadow-md ring-2 ring-offset-1 ring-black/20` 
                  : `${v} hover:opacity-80 hover:shadow-sm`
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <CreateBookingPanel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        staff={staff}
        timeBlocks={[]}
        defaultStart={new Date()}
        defaultEnd={new Date(Date.now() + 60*60*1000)}
        onCreate={(dto) => {
          setBookings((prev) => prev.concat({
            id: `new-${Date.now()}`,
            title: dto.title,
            clientName: dto.clientName,
            location: dto.location,
            staffId: dto.staffId,
            start: dto.start,
            end: dto.end,
            status: dto.status,
          } as any));
        }}
      />

      {/* Time-block panel removed as requested */}

      <EditBookingPanel
        open={editOpen}
        onClose={() => setEditOpen(false)}
        booking={selected}
        onSave={async (u) => {
          try {
            const original = bookings.find((b) => b.id === u.id);
            if (original && original.status !== u.status) {
              await BookingAPI.updateStatus(u.id, u.status);
            }
            await BookingAPI.update(u.id, {
              start: u.start,
              end: u.end,
              address: u.location,
              status: u.status,
            });
            setBookings((prev) => prev.map((x) => x.id === u.id ? u : x));
          } catch (e) {
            // noop simple error handling for now
          }
        }}
        onDelete={async (id) => {
          try {
            await BookingAPI.remove(id);
            setBookings((prev) => prev.filter((x) => x.id !== id));
            console.log('Booking deleted successfully');
          } catch (error) {
            console.error('Failed to delete booking:', error);
            alert('Failed to delete booking. Please try again.');
            throw error; // Re-throw to show error in EditBookingPanel
          }
        }}
      />

      {/* Saat query diisi, jika tidak ada hasil di minggu aktif, kalender otomatis lompat ke minggu hasil pertama */}

      {/* Grid */}
      <div className="w-full rounded-2xl overflow-x-auto border bg-slate-50">
        {bookings.length === 0 && (
          <div className="p-3 bg-amber-50 text-amber-800 border-b border-amber-200 text-sm">
            Tidak ada data booking dari API. Coba tambah booking baru atau cek koneksi server.
          </div>
        )}
        {/* Day headers */}
        <div className="min-w-[1000px] grid" style={{ gridTemplateColumns: `220px repeat(7, 1fr)` }}>
          <div className="bg-white border-b px-3 py-2 font-semibold sticky left-0 z-10">Staff / Waktu</div>
          {daysUTC.map((d, i) => (
            <div key={i} className={`bg-white border-b px-3 py-2 font-semibold text-center ${dayCounts[i] > 0 && statusFilter !== "ALL" ? "bg-amber-50" : ""}`}>
              <div className="flex items-center justify-center gap-2">
                <span>{fmtDayLabel(d)}</span>
                {dayCounts[i] > 0 && (
                  <span className={`inline-flex items-center justify-center text-[10px] px-2 py-0.5 rounded-full border ${statusFilter === "ALL" ? "bg-slate-100 text-slate-700 border-slate-200" : STATUS_COLOR[statusFilter]}`}>
                    {dayCounts[i]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Body rows per staff */}
        <DndContext onDragEnd={onDragEnd}>
          {filteredStaff.map((s) => (
            <div key={s.id} className="min-w-[1000px] grid border-t" style={{ gridTemplateColumns: `220px repeat(7, 1fr)` }}>
              {/* Lane header (staff) */}
              <div className="bg-white border-r p-3 sticky left-0 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color || "#e2e8f0" }}></div>
                  <div className="font-medium">{s.name}</div>
                </div>
                <div className="text-xs opacity-70 mt-1">{s.staffType}</div>
              </div>

              {/* 7 day columns for this staff */}
              {daysUTC.map((d, dayIdx) => {
                const laneKey = `${s.id}__${dayIdx}`;
                const dayStart = dayStartUTCWithHour(d);
                return (
                  <div key={laneKey} className="relative border-r bg-white">
                    {/* time ruler background */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: (hours.end - hours.start) + 1 }).map((_, h) => (
                        <div key={h} style={{ top: h * 60 * pxPerMin }} className="absolute left-0 right-0 border-t border-dashed border-slate-200 text-[10px] text-slate-500">
                          <span className="absolute -top-2 left-1 bg-white/70 px-1">{String(hours.start + h).padStart(2, '0')}:00</span>
                        </div>
                      ))}
                    </div>    

                    {/* droppable area */}
                    <DroppableLane laneId={laneKey}>
                      <div style={{ height: columnHeight }} className="relative">
                        {(() => {
                          const laneBookings = bookingsByLane.get(laneKey) || [];
                          const positionedEvents = getEventPositioning(laneBookings);
                          return positionedEvents.map((event) => (
                            <div key={event.id} onClick={() => { setSelected(event); setEditOpen(true); }}>
                              <DraggableBooking 
                                booking={event} 
                                pxPerMin={pxPerMin} 
                                dayStartUTC={dayStart} 
                                onChangeStatus={handleChangeStatus}
                                positioning={{ width: event.width, left: event.left, zIndex: event.zIndex }}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </DroppableLane>
                  </div>
                );
              })}
            </div>
          ))}
        </DndContext>
      </div>

      {/* Footer note */}
      <div className="mt-4 text-xs text-slate-600">
        <div className="flex items-center gap-2"><BadgeCheck className="w-3 h-3" /> Drag kartu booking ke hari/kolom lain untuk reschedule. Perubahan hanya di state demo—ganti ke panggilan API milikmu untuk persist.</div>
      </div>
    </div>
  );
}
