import { useState, useEffect } from "react";
import { useBookings } from "../../store/bookings";
import { type Booking, BookingStatus } from "../../api/types";
import { api } from "../../api/client";
import { Pencil, Trash2, CheckCircle } from "lucide-react";

export default function BookingsPage() {
  const { bookings, set } = useBookings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  // Fetch booking data (from MSW or API)
  useEffect(() => {
    const fetchBookings = async () => {
      const response = await api.get("/bookings");
      set({ bookings: response.data });
    };
    fetchBookings();
  }, [set]);

  const deleteBooking = async (id: string) => {
    await api.delete(`/bookings/${id}`);
    set({ bookings: bookings.filter((b) => b.id !== id) });
  };

  const updateBookingStatus = async (booking: Booking, status: BookingStatus) => {
    const updatedBooking = { ...booking, status };
    await api.patch(`/bookings/${booking.id}`, updatedBooking);
    set({
      bookings: bookings.map((b) =>
        b.id === booking.id ? updatedBooking : b
      ),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bookings Management</h2>

      <ul className="space-y-4">
        {bookings.map((b) => (
          <li key={b.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-md">
            <div>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm text-gray-500">Client: {b.clientName}</p>
              <p className="text-sm text-gray-500">{b.start} - {b.end}</p>
              <p className="text-sm text-gray-500">{b.location}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentBooking(b);
                  setIsModalOpen(true);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteBooking(b.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateBookingStatus(b, BookingStatus.CONFIRMED)}
                className="text-green-500 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && currentBooking && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold">Update Booking</h3>
            <div className="space-y-4 mt-4">
              <p>
                <span className="font-medium">Title:</span> {currentBooking.title}
              </p>
              <p>
                <span className="font-medium">Client:</span> {currentBooking.clientName}
              </p>
              <p>
                <span className="font-medium">Status:</span> {currentBooking.status}
              </p>
              {/* More fields as needed */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
