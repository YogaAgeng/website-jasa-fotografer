import { create } from "zustand";
import type { Staff } from "../api/types";
type S = { staff: Staff[]; set: (p: Partial<S>) => void; fetch: () => Promise<void>; };
export const useStaff = create<S>((set) => ({
  staff: [],
  set: (p) => set(p),
  fetch: async () => {
    // const { data } = await api.get("/staff");
    // set({ staff: data });
  },
}));
