import React, { useMemo, useState, useEffect } from "react";
import Drawer from "../ui/Drawer";
import Button from "../ui/Button";
import DatePicker from "../ui/DatePicker";
import TimePicker from "../ui/TimePicker";
import { isAvailable } from "../../store/timeBlocks";

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

type Staff = { id: string; name: string; staffType: "PHOTOGRAPHER" | "EDITOR" };
type TimeBlock = { id: string; staffId: string; start: string; end: string; type: "BUSY" | "AVAILABLE" };
type CreateBookingDto = {
  title: string;
  clientName: string;
  location?: string;
  staffId: string;
  start: string;
  end: string;
  status: BookingStatus;
  addOnIds?: string[];
  notes?: string;
};

export default function CreateBookingPanel({
  open,
  onClose,
  staff,
  timeBlocks,
  onCreate,
  defaultStart,
  defaultEnd,
}: {
  open: boolean;
  onClose: () => void;
  staff: Staff[];
  timeBlocks: TimeBlock[];
  onCreate: (dto: CreateBookingDto) => Promise<void> | void;
  defaultStart?: Date;
  defaultEnd?: Date;
}) {
  const [startDate, setStartDate] = useState<Date>(defaultStart || new Date());
  const [startTime, setStartTime] = useState<Date>(defaultStart || new Date());
  const [endDate, setEndDate] = useState<Date>(defaultEnd || new Date(Date.now() + 60 * 60 * 1000));
  const [endTime, setEndTime] = useState<Date>(defaultEnd || new Date(Date.now() + 60 * 60 * 1000));
  
  const [form, setForm] = useState<CreateBookingDto>({
    title: "",
    clientName: "",
    location: "",
    staffId: staff[0]?.id || "",
    start: (defaultStart || new Date()).toISOString(),
    end: (defaultEnd || new Date(Date.now() + 60 * 60 * 1000)).toISOString(),
    status: "CONFIRMED" as BookingStatus,
    addOnIds: [],
    notes: "",
  });

  // Combine date and time for start/end
  const combinedStart = useMemo(() => {
    const date = new Date(startDate);
    const time = new Date(startTime);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date;
  }, [startDate, startTime]);

  const combinedEnd = useMemo(() => {
    const date = new Date(endDate);
    const time = new Date(endTime);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date;
  }, [endDate, endTime]);

  const isOk = useMemo(() => {
    if (!form.staffId || !form.title || !form.clientName) return false;
    if (combinedEnd <= combinedStart) return false;
    return isAvailable({ staffId: form.staffId, start: combinedStart, end: combinedEnd, timeBlocks, existing: [] });
  }, [form, timeBlocks, combinedStart, combinedEnd]);

  function update<K extends keyof CreateBookingDto>(key: K, value: CreateBookingDto[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Sync date/time changes with form
  useEffect(() => {
    setForm((f) => ({ 
      ...f, 
      start: combinedStart.toISOString(),
      end: combinedEnd.toISOString()
    }));
  }, [combinedStart, combinedEnd]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isOk) return;
    
    // Update form with current date/time values
    const finalForm = {
      ...form,
      start: combinedStart.toISOString(),
      end: combinedEnd.toISOString()
    };
    
    await onCreate(finalForm);
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title="Create Booking">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium">Judul</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Client</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={form.clientName} onChange={(e) => update("clientName", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Lokasi</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={form.location || ""} onChange={(e) => update("location", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Staff</label>
          <select className="mt-1 w-full border rounded px-3 py-2 bg-white" value={form.staffId} onChange={(e) => update("staffId", e.target.value)}>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name} – {s.staffType}</option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Tanggal & Waktu Mulai</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <DatePicker 
                value={startDate} 
                onChange={setStartDate}
                placeholder="Pilih tanggal"
              />
              <TimePicker 
                value={startTime} 
                onChange={setStartTime}
                placeholder="Pilih waktu"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Tanggal & Waktu Selesai</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <DatePicker 
                value={endDate} 
                onChange={setEndDate}
                placeholder="Pilih tanggal"
              />
              <TimePicker 
                value={endTime} 
                onChange={setEndTime}
                placeholder="Pilih waktu"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Catatan</label>
          <textarea className="mt-1 w-full border rounded px-3 py-2" value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} />
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Preview Waktu:</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Mulai:</strong> {combinedStart.toLocaleString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}</div>
            <div><strong>Selesai:</strong> {combinedEnd.toLocaleString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}</div>
            <div><strong>Durasi:</strong> {Math.round((combinedEnd.getTime() - combinedStart.getTime()) / (1000 * 60))} menit</div>
          </div>
        </div>

        <div className="text-xs text-slate-600">{isOk ? "✅ Slot tersedia" : "❌ Tidak tersedia / overlap"}</div>
        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" className={`bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 ${!isOk ? "opacity-50 pointer-events-none" : ""}`}>Buat Booking</Button>
        </div>
      </form>
    </Drawer>
  );
}


