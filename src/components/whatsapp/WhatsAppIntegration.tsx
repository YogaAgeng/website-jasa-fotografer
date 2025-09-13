import { api } from '../../api/client';

export const sendWhatsAppMessage = async (phoneNumber: string, message: string, sessionId: string = 'photobooking') => {
  const formattedPhone = phoneNumber.replace(/^\+?62/, '62');
  try {
    const statusResponse = await api.get(`/api/session/status?id=${sessionId}`);
    const { ready, qr } = statusResponse.data;

    if (ready) {
      await api.post(`/api/send-message/${sessionId}`, { to: formattedPhone, text: message });
      alert('Pesan WhatsApp berhasil terkirim!');
    } else if (qr) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><body><h3>Scan QR untuk menghubungkan WhatsApp (Session ID: ${sessionId})</h3><img src="${qr}" style="max-width:320px"/></body></html>`);
      } else {
        alert('Pop-up diblokir. Silakan izinkan pop-up atau scan QR dari halaman WhatsApp Manager.');
      }
    } else {
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  } catch (error) {
    console.error('Failed to send WhatsApp message via API, falling back to wa.me:', error);
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  }
};

export default { sendWhatsAppMessage };