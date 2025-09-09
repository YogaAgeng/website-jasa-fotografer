import { create } from "zustand";
import { TimeBlocksAPI } from "../api/client";
import type { TimeBlock } from "../api/types";

type S = {
  timeBlocks: TimeBlock[];
  set: (p: Partial<S>) => void;
  fetch: (staffIds?: string[], fromISO?: string, toISO?: string) => Promise<void>;
  update: (id: string, payload: Partial<{ type: TimeBlock['type']; start: string; end: string }>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useTimeBlocks = create<S>((set) => ({
  timeBlocks: [],
  set: (p) => set(p),
  fetch: async (staffIds, fromISO, toISO) => {
    try {
      const data = await TimeBlocksAPI.list({ staffIds, from: fromISO, to: toISO });
      set({ timeBlocks: data as TimeBlock[] });
    } catch {
      set({ timeBlocks: [] });
    }
  },
  update: async (id, payload) => {
    await TimeBlocksAPI.update(id, payload as any);
    set((s) => ({
      timeBlocks: s.timeBlocks.map((tb) => tb.id === id ? { ...tb, ...(payload as any) } : tb)
    }));
  },
  remove: async (id) => {
    await TimeBlocksAPI.remove(id);
    set((s) => ({ timeBlocks: s.timeBlocks.filter((tb) => tb.id !== id) }));
  }
}));

export function isRangeOverlapping(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export function isAvailable(
  args: {
    staffId: string;
    start: Date;
    end: Date;
    timeBlocks: TimeBlock[];
    existing: { staffId: string; start: string; end: string }[];
  }
) {
  const { staffId, start, end, timeBlocks, existing } = args;
  for (const tb of timeBlocks) {
    if (tb.staffId !== staffId || tb.type !== "BUSY") continue;
    const tbStart = new Date(tb.start);
    const tbEnd = new Date(tb.end);
    if (isRangeOverlapping(start, end, tbStart, tbEnd)) return false;
  }
  for (const b of existing) {
    if (b.staffId !== staffId) continue;
    const bStart = new Date(b.start);
    const bEnd = new Date(b.end);
    if (isRangeOverlapping(start, end, bStart, bEnd)) return false;
  }
  return true;
}


