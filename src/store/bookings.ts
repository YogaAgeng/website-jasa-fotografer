import { create } from "zustand";
import type { Booking } from "../api/types";
type S = {
  bookings: Booking[];
  set: (p: Partial<S>) => void;
  update: (b: Booking) => Promise<void>;
};
export const useBookings = create<S>((set, get) => ({
  bookings: [],
  set: (p) => set(p),
  update: async (b) => {
    // await api.patch(`/bookings/${b.id}`, b);
    set({ bookings: get().bookings.map(x => x.id === b.id ? b : x) });
  },
}));
