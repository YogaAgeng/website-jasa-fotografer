import React, { useMemo, useState, useEffect } from "react";
import Drawer from "../ui/Drawer";
import Button from "../ui/Button";
import DatePicker from "../ui/DatePicker";
import TimePicker from "../ui/TimePicker";
import { TimeBlocksAPI } from "../../api/client";

type Staff = { id: string; name: string; staffType: "PHOTOGRAPHER" | "EDITOR" };
type BlockType = 'BUFFER' | 'TRAVEL' | 'OFF';

export default function CreateBlockPanel({
  open,
  onClose,
  staff,
  defaultStaffId,
  defaultStart,
  defaultEnd,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  staff: Staff[];
  defaultStaffId?: string;
  defaultStart?: Date;
  defaultEnd?: Date;
  onCreated?: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [staffId, setStaffId] = useState<string>(defaultStaffId || staff[0]?.id || "");
  const [type, setType] = useState<BlockType>('BUFFER');
  const [startDate, setStartDate] = useState<Date>(defaultStart || new Date());
  const [startTime, setStartTime] = useState<Date>(defaultStart || new Date());
  const [endDate, setEndDate] = useState<Date>(defaultEnd || new Date(Date.now() + 60 * 60 * 1000));
  const [endTime, setEndTime] = useState<Date>(defaultEnd || new Date(Date.now() + 60 * 60 * 1000));

  useEffect(() => {
    if (defaultStaffId) setStaffId(defaultStaffId);
  }, [defaultStaffId]);

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

  const isOk = staffId && combinedEnd > combinedStart;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isOk) return;
    try {
      setSubmitting(true);
      await TimeBlocksAPI.create({
        staffId,
        type,
        start: combinedStart.toISOString(),
        end: combinedEnd.toISOString(),
      } as any);
      onCreated?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Tambah Block Waktu">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium">Staff</label>
          <select className="mt-1 w-full border rounded px-3 py-2 bg-white" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name} – {s.staffType}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Jenis Block</label>
          <select className="mt-1 w-full border rounded px-3 py-2 bg-white" value={type} onChange={(e) => setType(e.target.value as BlockType)}>
            <option value="BUFFER">BUFFER</option>
            <option value="TRAVEL">TRAVEL</option>
            <option value="OFF">OFF</option>
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
        <div className="text-xs text-slate-600">{isOk ? "✅ Rentang valid" : "❌ Waktu tidak valid"}</div>
        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary" loading={submitting} disabled={!isOk || submitting}>Simpan</Button>
        </div>
      </form>
    </Drawer>
  );
}


