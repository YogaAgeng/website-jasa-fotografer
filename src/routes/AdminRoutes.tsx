import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import CalendarPage from "../pages/admin/CalendarPage.tsx";
import StaffPage from "../pages/admin/StaffPage.tsx";
import BookingsPage from "../pages/admin/BookingsPage.tsx";
import PaymentsPage from "../pages/admin/PaymentsPage.tsx";
import WhatsAppPage from "../pages/admin/WhatsAppPage.tsx";

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <ErrorBoundary>
        <Routes>
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
        </Routes>
      </ErrorBoundary>
    </AdminLayout>
  );
}
