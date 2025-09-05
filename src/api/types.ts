// src/api/types.ts
export type StaffType = "PHOTOGRAPHER" | "EDITOR";

export enum BookingStatus {
  INQUIRY = "INQUIRY",
  HOLD = "HOLD",
  CONFIRMED = "CONFIRMED",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  EDITING = "EDITING",
  REVIEW = "REVIEW",
  DELIVERED = "DELIVERED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export type Staff = {
  id: string;
  name: string;
  staffType: StaffType;
  color?: string;
};

export type Booking = {
  id: string;
  title: string;
  clientName: string;
  location?: string;
  staffId: string;
  start: string; // ISO string in UTC
  end: string;   // ISO string in UTC
  status: BookingStatus; // Correctly typed as an enum
  notes?: string; // optional field for additional information
  email?: string; // optional
  contactNumber?: string; // optional
  packageName?: string; // optional
};
