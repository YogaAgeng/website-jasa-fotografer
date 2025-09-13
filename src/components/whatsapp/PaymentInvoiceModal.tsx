import { useState, useEffect } from 'react';
import type { Payment, Booking } from '../../api/types';
import Button from '../ui/Button';
import { sendWhatsAppMessage } from './WhatsAppIntegration';
import { X, FileText, MessageCircle, CreditCard, Calendar, User, MapPin } from 'lucide-react';

interface PaymentInvoiceModalProps {
  payment: Payment;
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

function PaymentInvoiceModal({ payment, booking, isOpen, onClose }: PaymentInvoiceModalProps) {
  const [invoiceText, setInvoiceText] = useState("");
  const [staffName, setStaffName] = useState("N/A");
  const [staffType, setStaffType] = useState("N/A");

  // Generate descriptive title based on booking details
  const generateDescriptiveTitle = (booking: Booking) => {
    // Jika ada title yang diinput user dan tidak kosong, gunakan title tersebut
    if (booking.title && booking.title.trim() !== '') {
      return booking.title;
    }
    
    // Jika title kosong, gunakan nama klien sebagai fallback
    const clientName = booking.clientName || 'Klien';
    return `Sesi Foto ${clientName}`;
  };

  const buildPaymentInvoiceMessage = (p: Payment, b: Booking, sName: string, sType: string) => {
    const paidAtDate = p.paidAt ? new Date(p.paidAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const paidAtTime = p.paidAt ? new Date(p.paidAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const bookingStartDate = b.start ? new Date(b.start).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const bookingStartTime = b.start ? new Date(b.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const bookingEndTime = b.end ? new Date(b.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

    const descriptiveTitle = generateDescriptiveTitle(b);

    return `🧾 *INVOICE PEMBAYARAN HYUGA PHOTO*

*Detail Pembayaran:*
• ID Pembayaran: ${p.id.slice(0, 8)}...
• Jumlah: Rp ${p.amount?.toLocaleString('id-ID')}
• Metode: ${p.method}
• Tanggal Bayar: ${paidAtDate} ${paidAtTime}

*Detail Booking:*
• ID Booking: ${b.id.slice(0, 8)}...
• Judul: ${descriptiveTitle}
• Klien: ${b.clientName || 'Unknown Client'}
• Telepon Klien: ${b.clientPhone || 'Tidak tersedia'}
• Status Booking: ${b.status || 'UNKNOWN'}

*Jadwal Booking:*
• Tanggal: ${bookingStartDate}
• Waktu: ${bookingStartTime} - ${bookingEndTime}

*Penugasan Staff:*
• ${sType}: ${sName}

*Catatan:* Ini adalah invoice pembayaran otomatis dari Sistem Photo Booking.

Terima kasih telah menggunakan layanan kami! 📸`;
  };

  useEffect(() => {
    if (isOpen && booking) {
      const fetchStaff = async () => {
        let currentStaffName = "N/A";
        let currentStaffType = "N/A";
        
        if (booking.staffId) {
          try {
            const staffData = await fetch('/api/staff').then(res => res.json());
            const staffMember = staffData.find((s: any) => s.id === booking.staffId);
            if (staffMember) {
              currentStaffName = staffMember.name;
              currentStaffType = staffMember.staffType;
              setStaffName(currentStaffName);
              setStaffType(currentStaffType);
            }
          } catch (error) {
            console.error("Failed to fetch staff info:", error);
          }
        }
        
        // Set invoice text with current staff info
        setInvoiceText(buildPaymentInvoiceMessage(payment, booking, currentStaffName, currentStaffType));
      };
      
      fetchStaff();
    }
  }, [isOpen, payment, booking]);

  const handleSendWhatsApp = () => {
    if (booking.clientPhone) {
      sendWhatsAppMessage(booking.clientPhone, invoiceText);
      onClose();
    } else {
      alert('Nomor WhatsApp klien tidak tersedia.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Preview Invoice Pembayaran
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-gray-50 border rounded p-3 h-64 overflow-auto whitespace-pre-wrap text-sm">
          {invoiceText}
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button
            className="flex-1"
            onClick={handleSendWhatsApp}
            disabled={!booking.clientPhone}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Kirim via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentInvoiceModal;