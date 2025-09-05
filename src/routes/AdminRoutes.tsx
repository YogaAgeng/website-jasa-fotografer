import { Route, Routes, NavLink } from "react-router-dom";
import CalendarPage from "../pages/admin/CalendarPage.tsx";
import StaffPage from "../pages/admin/StaffPage.tsx";
import BookingsPage from "../pages/admin/BookingsPage.tsx";

export default function AdminRoutes() {
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 bg-white border-b px-4 py-2 flex gap-4">
        <NavLink to="/admin/calendar" className="hover:underline">Calendar</NavLink>
        <NavLink to="/admin/staff" className="hover:underline">Staff</NavLink>
        <NavLink to="/admin/bookings" className="hover:underline">Bookings</NavLink>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
