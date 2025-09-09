import { useState, useEffect } from 'react';
import { BookingAPI, StaffAPI } from '../../api/client';
import type { Booking, BookingStatus, Staff } from '../../api/types';
import Button from '../../components/ui/Button';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Edit, 
  Trash2,
  Download,
  RefreshCw,
  Camera,
  Monitor,
  FileText,
  MessageCircle
} from 'lucide-react';
import { api } from '../../api/client';

const STATUS_COLORS: Record<BookingStatus, string> = {
  INQUIRY: 'bg-yellow-100 text-yellow-800',
  HOLD: 'bg-orange-100 text-orange-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  EDITING: 'bg-indigo-100 text-indigo-800',
  REVIEW: 'bg-pink-100 text-pink-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-red-200 text-red-900',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [invoiceText, setInvoiceText] = useState<string>("");
  const [editForm, setEditForm] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: ''
  });

  useEffect(() => {
    loadBookings();
    loadStaff();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await BookingAPI.list();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await StaffAPI.list();
      setStaff(data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: string, bookingTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete booking "${bookingTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await BookingAPI.remove(bookingId);
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      // Show success message (optional)
      console.log('Booking deleted successfully');
    } catch (error) {
      console.error('Failed to delete booking:', error);
      alert('Failed to delete booking. Please try again.');
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);
    
    setEditForm({
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().slice(0, 5),
      location: booking.location || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;

    try {
      const startDateTime = new Date(`${editForm.startDate}T${editForm.startTime}`);
      const endDateTime = new Date(`${editForm.endDate}T${editForm.endTime}`);

      if (endDateTime <= startDateTime) {
        alert('End time must be after start time');
        return;
      }

      await BookingAPI.update(editingBooking.id, {
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        address: editForm.location,
      });

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === editingBooking.id 
          ? { 
              ...booking, 
              start: startDateTime.toISOString(),
              end: endDateTime.toISOString(),
              location: editForm.location 
            }
          : booking
      ));

      setEditingBooking(null);
      console.log('Booking updated successfully');
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const getStaffInfo = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember;
  };

  const generateInvoice = (booking: Booking) => {
    const staffInfo = getStaffInfo(booking.staffId || '');
    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);
    
    const invoiceData = {
      bookingId: booking.id,
      title: booking.title || 'Untitled',
      clientName: booking.clientName || 'Unknown Client',
      clientPhone: booking.clientPhone || 'No phone number',
      staffName: staffInfo?.name || 'No staff assigned',
      staffType: staffInfo?.staffType || 'N/A',
      location: booking.location || 'No location specified',
      status: booking.status || 'UNKNOWN',
      startDate: startDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      startTime: startDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      endTime: endDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) + ' hours'
    };

    return invoiceData;
  };

  const buildInvoiceMessage = (booking: Booking) => {
    const invoice = generateInvoice(booking);
    const message = `📋 *INVOICE BOOKING PHOTO*

*Booking Details:*
• ID: ${invoice.bookingId.slice(0, 8)}...
• Title: ${invoice.title}
• Client: ${invoice.clientName}
• Status: ${invoice.status}

*Schedule:*
• Date: ${invoice.startDate}
• Time: ${invoice.startTime} - ${invoice.endTime}
• Duration: ${invoice.duration}

*Staff Assignment:*
• ${invoice.staffType}: ${invoice.staffName}

*Location:*
• ${invoice.location}

*Note:* This is an automated invoice from Photo Booking System.

Thank you for choosing our services! 📸`;
    return message;
  };

  const openInvoicePreview = (booking: Booking) => {
    setInvoiceBooking(booking);
    setInvoiceText(buildInvoiceMessage(booking));
  };

  const sendInvoiceToWhatsApp = (booking: Booking) => {
    const phoneNumber = booking.clientPhone || '';
    if (!phoneNumber) {
      alert('No WhatsApp number available for this client');
      return;
    }
    const formattedPhone = phoneNumber.replace(/^\+?62/, '62');
    const message = buildInvoiceMessage(booking);
    
    // Prefer kirim via backend whatsapp-web.js; fallback ke wa.me jika belum ready
    api.get('/wa/status').then((r) => {
      if (r.data?.ready) {
        api.post('/wa/send', { phone: formattedPhone, message })
          .then(() => alert('Invoice terkirim via WhatsApp'))
          .catch(() => window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank'));
      } else if (r.data?.qr) {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(`<html><body><h3>Scan QR untuk menghubungkan WhatsApp</h3><img src="${r.data.qr}" style="max-width:320px"/></body></html>`);
        } else {
          alert('Scan QR WhatsApp dari halaman /wa/status');
        }
      } else {
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    }).catch(() => {
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    });
  };

  const filteredBookings = bookings
    .filter(booking => {
      // Safe search with null checks
      const matchesSearch = (() => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          (booking.title && booking.title.toLowerCase().includes(searchLower)) ||
          (booking.clientName && booking.clientName.toLowerCase().includes(searchLower)) ||
          (booking.location && booking.location.toLowerCase().includes(searchLower))
        );
      })();
      
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
      
      const matchesDate = (() => {
        if (dateFilter === 'ALL' || !booking.start) return true;
        const bookingDate = new Date(booking.start);
        const now = new Date();
        
        switch (dateFilter) {
          case 'TODAY':
            return bookingDate.toDateString() === now.toDateString();
          case 'THIS_WEEK':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return bookingDate >= weekStart && bookingDate <= weekEnd;
          case 'THIS_MONTH':
            return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
          case 'UPCOMING':
            return bookingDate > now;
          case 'PAST':
            return bookingDate < now;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = a.start ? new Date(a.start).getTime() : 0;
          const dateB = b.start ? new Date(b.start).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'title':
          const titleA = a.title || '';
          const titleB = b.title || '';
          comparison = titleA.localeCompare(titleB);
          break;
        case 'client':
          const clientA = a.clientName || '';
          const clientB = b.clientName || '';
          comparison = clientA.localeCompare(clientB);
          break;
        case 'status':
          const statusA = a.status || '';
          const statusB = b.status || '';
          comparison = statusA.localeCompare(statusB);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    bookings.forEach(booking => {
      if (booking.status) {
        counts[booking.status] = (counts[booking.status] || 0) + 1;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bookings Management</h2>
          <p className="text-gray-600">Manage and view all booking requests</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadBookings}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.CONFIRMED || 0}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inquiry</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.INQUIRY || 0}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => {
                  const bookingDate = new Date(b.start);
                  const now = new Date();
                  const weekStart = new Date(now);
                  weekStart.setDate(now.getDate() - now.getDay());
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  return bookingDate >= weekStart && bookingDate <= weekEnd;
                }).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, client, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            {Object.keys(STATUS_COLORS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="PAST">Past</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="client-asc">Client (A-Z)</option>
            <option value="client-desc">Client (Z-A)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
          </select>

          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                const staffInfo = getStaffInfo(booking.staffId || '');
                return (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.clientPhone || 'No WhatsApp'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.clientPhone ? 'Click to chat' : 'Not available'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {staffInfo ? (
                        <>
                          {staffInfo.staffType === 'PHOTOGRAPHER' ? (
                            <Camera className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Monitor className="w-4 h-4 text-purple-500" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{staffInfo.name}</div>
                            <div className="text-xs text-gray-500">{staffInfo.staffType}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">No staff assigned</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">{booking.clientName || 'Unknown Client'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        {booking.start ? (
                          <>
                            <div className="text-sm text-gray-900">
                              {new Date(booking.start).toLocaleDateString('id-ID', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(booking.start).toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {booking.end ? new Date(booking.end).toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : 'N/A'}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">No date set</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">{booking.location || '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                      {booking.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        leftIcon={<Edit className="w-3 h-3" />}
                        onClick={() => handleEditBooking(booking)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        leftIcon={<FileText className="w-3 h-3" />}
                        onClick={() => openInvoicePreview(booking)}
                        disabled={!booking.clientPhone}
                      >
                        Invoice
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        leftIcon={<Trash2 className="w-3 h-3" />}
                        onClick={() => handleDeleteBooking(booking.id, booking.title || 'Untitled')}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' 
                ? 'No bookings found matching your filters.' 
                : 'No bookings found.'}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBookings.length}</span> of{' '}
            <span className="font-medium">{filteredBookings.length}</span> results
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" disabled>Previous</Button>
            <Button size="sm" variant="ghost" disabled>Next</Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Booking - {editingBooking.title}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setEditingBooking(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {invoiceBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 space-y-4">
            <h3 className="text-lg font-semibold">Preview Invoice</h3>
            <div className="bg-gray-50 border rounded p-3 h-64 overflow-auto whitespace-pre-wrap text-sm">
              {invoiceText}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={() => setInvoiceBooking(null)}
              >
                Tutup
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  sendInvoiceToWhatsApp(invoiceBooking);
                  setInvoiceBooking(null);
                }}
              >
                Kirim via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}