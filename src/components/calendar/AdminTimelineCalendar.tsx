/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Users, MapPin, BadgeCheck } from "lucide-react";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";

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

const demoStaff: Staff[] = [
  { id: "stf-rina", name: "Rina", staffType: "PHOTOGRAPHER", color: "#dbeafe" },
  { id: "stf-adi", name: "Adi", staffType: "PHOTOGRAPHER", color: "#fef9c3" },
  { id: "stf-andi", name: "Andi", staffType: "EDITOR", color: "#e9d5ff" },
];

const nowUTC = new Date();
const weekStartUTC = startOfWeekUTC(nowUTC);

const demoBookings: Booking[] = [
  {
    id: "bkg-001",
    title: "Portrait – Basic 2 Jam",
    clientName: "Budi",
    location: "Studio A",
    staffId: "stf-rina",
    start: setTimeUTC(weekStartUTC, 2 + 7, 0).toISOString(), // Mon 09:00 WIB == 02:00 UTC
    end: setTimeUTC(weekStartUTC, 4 + 7, 0).toISOString(),   // Mon 11:00 WIB
    status: "CONFIRMED",
  },
  {
    id: "bkg-002",
    title: "Event – 4 Jam",
    clientName: "SMA 3",
    location: "Aula Sekolah",
    staffId: "stf-adi",
    start: setTimeUTC(addDays(weekStartUTC, 2), 1 + 7, 30).toISOString(), // Wed 08:30 WIB
    end: setTimeUTC(addDays(weekStartUTC, 2), 5 + 7, 30).toISOString(),   // Wed 12:30 WIB
    status: "SCHEDULED",
  },
  {
    id: "bkg-003",
    title: "Editing – 60 foto",
    clientName: "Keluarga Dony",
    location: "—",
    staffId: "stf-andi",
    start: setTimeUTC(addDays(weekStartUTC, 3), 2 + 7, 0).toISOString(),
    end: setTimeUTC(addDays(weekStartUTC, 3), 5 + 7, 0).toISOString(),
    status: "EDITING",
  },
];

// ----------------------------- DnD wrappers

function DraggableBooking({
  booking,
  pxPerMin,
  dayStartUTC,
}: {
  booking: Booking;
  pxPerMin: number;
  dayStartUTC: Date;
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
  };

  const color = STATUS_COLOR[booking.status];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`absolute w-[95%] left-[2.5%] rounded-xl shadow-sm border border-black/5 p-2 text-[11px] ${color} ${isDragging ? "opacity-80 ring-2 ring-black/10" : ""}`}
      style={style}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold truncate">{booking.title}</span>
        <span className="shrink-0 text-[10px] font-medium">
          {formatHM(start)}–{formatHM(end)}
        </span>
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

  // Data state (would come from API in real app)
  const [staff, setStaff] = useState<Staff[]>(demoStaff);
  const [bookings, setBookings] = useState<Booking[]>(demoBookings);

  const hours = { start: 7, end: 19 }; // 07:00–19:00 local WIB (but we draw using UTC baseline)
  const columnHeight = (hours.end - hours.start) * 60 * pxPerMin; // minutes * pxPerMin

  // Build days for the selected week
  const daysUTC = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  // Lane id generator: staffId__dayIndex
  const laneId = (staffId: string, dayIndex: number) => `${staffId}__${dayIndex}`;

  // Day start (UTC) baseline for vertical placement: set to 07:00 local (== 00:00 UTC + 7h)
  function dayStartUTCWithHour(dUTC: Date) { return setTimeUTC(dUTC, hours.start + 0, 0); }

  // Filter staff list
  const filteredStaff = useMemo(
    () => (staffFilter === "ALL" ? staff : staff.filter((s) => s.staffType === staffFilter)),
    [staff, staffFilter]
  );

  // Map bookings grouped by staffId & dayIndex
  const bookingsByLane = useMemo(() => {
    const m = new Map<string, Booking[]>();
    for (const b of bookings) {
      const d = toDate(b.start);
      const di = Math.floor((stripTime(d).getTime() - stripTime(weekStart).getTime()) / 86400000);
      if (di < 0 || di > 6) continue; // out of visible range
      const key = laneId(b.staffId, di);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(b);
    }
    return m;
  }, [bookings, weekStart]);

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
        <div className="flex items-center gap-2">
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
              className="text-sm outline-none"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value as any)}
            >
              <option value="ALL">All Staff</option>
              <option value="PHOTOGRAPHER">Photographers</option>
              <option value="EDITOR">Editors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4 text-[11px]">
        {Object.entries(STATUS_COLOR).map(([k, v]) => (
          <span key={k} className={`px-2 py-1 rounded-md border ${v}`}>{k}</span>
        ))}
      </div>

      {/* Grid */}
      <div className="w-full rounded-2xl overflow-hidden border bg-slate-50">
        {/* Day headers */}
        <div className="grid" style={{ gridTemplateColumns: `220px repeat(7, 1fr)` }}>
          <div className="bg-white border-b px-3 py-2 font-semibold">Staff / Waktu</div>
          {daysUTC.map((d, i) => (
            <div key={i} className="bg-white border-b px-3 py-2 font-semibold text-center">
              {fmtDayLabel(d)}
            </div>
          ))}
        </div>

        {/* Body rows per staff */}
        <DndContext onDragEnd={onDragEnd}>
          {filteredStaff.map((s) => (
            <div key={s.id} className="grid border-t" style={{ gridTemplateColumns: `220px repeat(7, 1fr)` }}>
              {/* Lane header (staff) */}
              <div className="bg-white border-r p-3">
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
                        {(bookingsByLane.get(laneKey) || []).map((b) => (
                          <DraggableBooking key={b.id} booking={b} pxPerMin={pxPerMin} dayStartUTC={dayStart} />
                        ))}
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
