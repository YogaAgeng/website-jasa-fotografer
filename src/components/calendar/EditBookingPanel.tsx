import React, { useMemo, useState, useEffect } from "react";
import Drawer from "../ui/Drawer";
import Button from "../ui/Button";
import DatePicker from "../ui/DatePicker";
import TimePicker from "../ui/TimePicker";

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
  staffId: string;
  start: string;
  end: string;
  status: BookingStatus;
};

export default function EditBookingPanel({
  open,
  onClose,
  booking,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSave: (updated: Booking) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(booking?.title || "");
  const [clientName, setClientName] = useState(booking?.clientName || "");
  const [location, setLocation] = useState(booking?.location || "");
  const [status, setStatus] = useState<BookingStatus>(booking?.status || "CONFIRMED");

  const initialStart = booking ? new Date(booking.start) : new Date();
  const initialEnd = booking ? new Date(booking.end) : new Date(Date.now() + 60 * 60 * 1000);

  const [startDate, setStartDate] = useState<Date>(initialStart);
  const [startTime, setStartTime] = useState<Date>(initialStart);
  const [endDate, setEndDate] = useState<Date>(initialEnd);
  const [endTime, setEndTime] = useState<Date>(initialEnd);

  useEffect(() => {
    if (!booking) return;
    setTitle(booking.title);
    setClientName(booking.clientName);
    setLocation(booking.location || "");
    setStatus(booking.status);
    const s = new Date(booking.start);
    const e = new Date(booking.end);
    setStartDate(s); setStartTime(s);
    setEndDate(e); setEndTime(e);
  }, [booking]);

  const combinedStart = useMemo(() => {
    const d = new Date(startDate);
    const t = new Date(startTime);
    d.setHours(t.getHours(), t.getMinutes(), 0, 0);
    return d;
  }, [startDate, startTime]);

  const combinedEnd = useMemo(() => {
    const d = new Date(endDate);
    const t = new Date(endTime);
    d.setHours(t.getHours(), t.getMinutes(), 0, 0);
    return d;
  }, [endDate, endTime]);

  const isOk = !!booking && title.trim() && clientName.trim() && combinedEnd > combinedStart;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isOk || !booking) return;
    try {
      setSubmitting(true);
      await onSave({
        ...booking,
        title: title.trim(),
        clientName: clientName.trim(),
        location: location || undefined,
        status,
        start: combinedStart.toISOString(),
        end: combinedEnd.toISOString(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!booking) return;
    
    if (!window.confirm(`Are you sure you want to delete booking "${booking.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setSubmitting(true);
      await onDelete(booking.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete booking:', error);
      alert('Failed to delete booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Edit Booking">
      {!booking ? null : (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Judul</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Client</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Lokasi</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select className="mt-1 w-full border rounded px-3 py-2 bg-white" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
              {[
                "INQUIRY","HOLD","CONFIRMED","SCHEDULED","IN_PROGRESS","EDITING","REVIEW","DELIVERED","CLOSED","CANCELLED","EXPIRED"
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Mulai</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <DatePicker value={startDate} onChange={setStartDate} />
                <TimePicker value={startTime} onChange={setStartTime} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Selesai</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <DatePicker value={endDate} onChange={setEndDate} />
                <TimePicker value={endTime} onChange={setEndTime} />
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-600">{isOk ? "✅ Data valid" : "❌ Lengkapi data & periksa waktu"}</div>
          <div className="pt-2 flex justify-between gap-2">
            <Button type="button" variant="danger" loading={submitting} onClick={handleDelete}>Hapus</Button>
            <div className="flex gap-2">
              <Button type="button" onClick={onClose}>Batal</Button>
              <Button type="submit" variant="primary" loading={submitting} disabled={!isOk || submitting}>Simpan</Button>
            </div>
          </div>
        </form>
      )}
    </Drawer>
  );
}


