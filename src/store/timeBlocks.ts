import { create } from "zustand";
import { api } from "../api/client";
import type { TimeBlock } from "../api/types";

type S = {
  timeBlocks: TimeBlock[];
  set: (p: Partial<S>) => void;
  fetch: (staffIds?: string[], fromISO?: string, toISO?: string) => Promise<void>;
};

export const useTimeBlocks = create<S>((set) => ({
  timeBlocks: [],
  set: (p) => set(p),
  fetch: async (staffIds, fromISO, toISO) => {
    try {
      // const { data } = await api.get("/time-blocks", { params: { staffIds, from: fromISO, to: toISO } });
      // set({ timeBlocks: data });
      // Demo data when backend is not connected
      const demo: TimeBlock[] = [];
      set({ timeBlocks: demo });
    } catch (err) {
      // noop for demo
      set({ timeBlocks: [] });
    }
  },
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


