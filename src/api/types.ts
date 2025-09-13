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
  clientPhone?: string; // WhatsApp number
  packageName?: string; // optional
};

export type AddOn = {
  id: string;
  name: string;
  price: number;
};

export type TimeBlockType = "BUSY" | "AVAILABLE";

export type TimeBlock = {
  id: string;
  staffId: string;
  start: string; // ISO in UTC
  end: string;   // ISO in UTC
  type: TimeBlockType; // BUSY means blocked/unavailable
  note?: string;
};

export type CreateBookingDto = {
  title: string;
  clientName: string;
  location?: string;
  staffId: string;
  start: string; // ISO UTC
  end: string;   // ISO UTC
  status: BookingStatus;
  addOnIds?: string[];
  notes?: string;
};

export type Payment = {
  id: string;
  bookingId: string;
  method: 'EWALLET' | 'VA' | 'CASH' | 'BANK_TRANSFER';
  amount: number;
  paidAt: string;
  clientName?: string;
  bookingStart?: string;
  bookingEnd?: string;
};