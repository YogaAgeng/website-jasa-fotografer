import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080",
  withCredentials: false,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const BookingAPI = {
  async create(payload: any) {
    return (await api.post("/bookings", payload)).data;
  },
  async list(params?: any) {
    return (await api.get("/bookings", { params })).data;
  },
  async get(id: string) {
    return (await api.get(`/bookings/${id}`)).data;
  },
  async update(id: string, payload: any) {
    return (await api.put(`/bookings/${id}`, payload)).data;
  },
  async remove(id: string) {
    return (await api.delete(`/bookings/${id}`)).data;
  },
  async updateStatus(id: string, toStatus: string, note?: string) {
    return (await api.post(`/bookings/${id}/status`, { toStatus, note })).data;
  },
};

export const TimeBlocksAPI = {
  async list(params?: { staffIds?: string[]; from?: string; to?: string }) {
    return (await api.get("/time-blocks", { params })).data;
  },
  async create(payload: { staffId: string; bookingId?: string; type: 'BOOKING'|'BUFFER'|'TRAVEL'|'OFF'; start: string; end: string; }) {
    return (await api.post("/time-blocks", payload)).data;
  },
  async update(id: string, payload: Partial<{ type: 'BOOKING'|'BUFFER'|'TRAVEL'|'OFF'; start: string; end: string }>) {
    return (await api.put(`/time-blocks/${id}`, payload)).data;
  },
  async remove(id: string) {
    return (await api.delete(`/time-blocks/${id}`)).data;
  }
};

export const AssignmentsAPI = {
  async create(payload: { bookingId: string; staffId: string; role?: 'MAIN'|'ASSISTANT'|'EDITOR'; start: string; end: string }) {
    return (await api.post('/assignments', payload)).data;
  }
};

export const StaffAPI = {
  async list() {
    return (await api.get('/staff')).data;
  },
  async create(payload: { staffType: 'PHOTOGRAPHER'|'EDITOR'; name: string; phone?: string; email?: string; homeBase?: string; active?: boolean }) {
    return (await api.post('/staff', payload)).data;
  },
  async get(id: string) {
    return (await api.get(`/staff/${id}`)).data;
  },
  async update(id: string, payload: { staffType?: 'PHOTOGRAPHER'|'EDITOR'; name?: string; phone?: string; email?: string; homeBase?: string; active?: boolean }) {
    return (await api.put(`/staff/${id}`, payload)).data;
  },
  async remove(id: string) {
    return (await api.delete(`/staff/${id}`)).data;
  }
};

export const PaymentAPI = {
  async list(params?: { bookingId?: string; from?: string; to?: string }) {
    return (await api.get('/payments', { params })).data;
  },
  async create(payload: { bookingId: string; method: 'EWALLET'|'VA'|'CASH'|'BANK_TRANSFER'; amount: number; paidAt?: string }) {
    return (await api.post('/payments', payload)).data;
  },
  async remove(id: string) {
    return (await api.delete(`/payments/${id}`)).data;
  }
};

// WhatsApp Session API
export const WhatsAppSessionAPI = {
  async list() {
    return (await api.get('/api/session/list')).data;
  },
  async create(payload: { sessionId?: string; deviceType?: 'android' | 'ios' | 'web' }) {
    return (await api.post('/api/session/create', payload)).data;
  },
  async getStatus(sessionId: string) {
    return (await api.get(`/api/session/status?id=${sessionId}`)).data;
  },
  async getQR(sessionId: string) {
    return (await api.get(`/api/session/qr?id=${sessionId}`)).data;
  },
  async sendMessage(sessionId: string, payload: { to: string | string[]; text: string }) {
    return (await api.post(`/api/send-message/${sessionId}`, payload)).data;
  },
  async delete(sessionId: string) {
    return (await api.delete(`/api/session/${sessionId}`)).data;
  }
};