import { useEffect, useMemo, useState } from 'react';
import { PaymentAPI, BookingAPI } from '../../api/client';
import type { BookingStatus, Booking, Payment } from '../../api/types';
import Button from '../../components/ui/Button';
import PaymentInvoiceModal from '../../components/whatsapp/PaymentInvoiceModal';
import { CreditCard, Plus, Trash2, Calendar, User, MessageCircle, FileText } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ bookingId: '', method: 'CASH' as Payment['method'], amount: '' });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const [pays, books] = await Promise.all([
        PaymentAPI.list(),
        BookingAPI.list({})
      ]);
      setPayments(pays);
      setBookings(books);
    } finally {
      setLoading(false);
    }
  }

  const totalAmount = useMemo(() => payments.reduce((s, p) => s + (p.amount || 0), 0), [payments]);

  async function createPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!form.bookingId || !form.amount) return;
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) return;
    await PaymentAPI.create({ bookingId: form.bookingId, method: form.method, amount });
    setCreating(false);
    setForm({ bookingId: '', method: 'CASH', amount: '' });
    await load();
  }

  async function deletePayment(id: string) {
    if (!confirm('Hapus pembayaran ini?')) return;
    await PaymentAPI.remove(id);
    await load();
  }

  const handleShowInvoice = (payment: Payment) => {
    const booking = bookings.find(b => b.id === payment.bookingId);
    if (booking) {
      setSelectedPayment(payment);
      setSelectedBooking(booking);
      setShowInvoice(true);
    } else {
      alert('Booking information not found');
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedPayment(null);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">Loading payments...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5"/> Payments</h1>
        <Button leftIcon={<Plus className="w-4 h-4"/>} onClick={() => setCreating(true)}>New Payment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-gray-500 text-sm">Total Payments</div>
          <div className="text-2xl font-bold">Rp {totalAmount.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/><span>{p.clientName || '-'}</span></div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400"/>
                      <span>{p.bookingStart ? new Date(p.bookingStart).toLocaleString() : '-'} </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">{p.method}</td>
                  <td className="px-6 py-3 font-semibold">Rp {p.amount?.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-3 text-sm">{p.paidAt ? new Date(p.paidAt).toLocaleString() : '-'}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        leftIcon={<FileText className="w-3 h-3" />}
                        onClick={() => handleShowInvoice(p)}
                      >
                        Invoice
                      </Button>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        leftIcon={<MessageCircle className="w-3 h-3" />}
                        onClick={() => handleShowInvoice(p)}
                      >
                        WhatsApp
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        leftIcon={<Trash2 className="w-3 h-3" />} 
                        onClick={() => deletePayment(p.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Belum ada pembayaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tambah Pembayaran</h3>
            <form className="space-y-4" onSubmit={createPayment}>
              <div>
                <label className="block text-sm font-medium mb-1">Booking</label>
                <select 
                  value={form.bookingId}
                  onChange={(e) => setForm(f => ({ ...f, bookingId: e.target.value }))}
                  className="w-full border rounded px-3 py-2 bg-white"
                >
                  <option value="">Pilih booking</option>
                  {bookings.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.clientName || 'Client'} — {new Date(b.start).toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Metode</label>
                  <select 
                    value={form.method}
                    onChange={(e) => setForm(f => ({ ...f, method: e.target.value as any }))}
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                    <option value="VA">VA</option>
                    <option value="EWALLET">EWALLET</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
                  <input 
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="1000000"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setCreating(false)}>Batal</Button>
                <Button type="submit" className="flex-1">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Invoice Modal */}
      {selectedPayment && selectedBooking && (
        <PaymentInvoiceModal
          payment={selectedPayment}
          booking={selectedBooking}
          isOpen={showInvoice}
          onClose={handleCloseInvoice}
        />
      )}
    </div>
  );
}


