import { create } from 'zustand';
import type { WhatsAppSession, CreateSessionDto, SessionStatus } from '../api/whatsappTypes';
import { WhatsAppSessionAPI } from '../api/client';

interface WhatsAppSessionStore {
  sessions: WhatsAppSession[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadSessions: () => Promise<void>;
  createSession: (payload: CreateSessionDto) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessionStatus: (sessionId: string) => Promise<void>;
  getSessionStatus: (sessionId: string) => Promise<SessionStatus>;
  getQRCode: (sessionId: string) => Promise<string>;
  sendMessage: (sessionId: string, to: string | string[], text: string) => Promise<void>;
  
  // UI State
  selectedSession: string | null;
  qrCode: string | null;
  setSelectedSession: (sessionId: string | null) => void;
  setQRCode: (qrCode: string | null) => void;
  clearError: () => void;
}

export const useWhatsAppSessionStore = create<WhatsAppSessionStore>((set, get) => ({
  sessions: [],
  loading: false,
  error: null,
  selectedSession: null,
  qrCode: null,

  loadSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await WhatsAppSessionAPI.list();
      set({ sessions, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to load sessions',
        loading: false 
      });
    }
  },

  createSession: async (payload: CreateSessionDto) => {
    set({ loading: true, error: null });
    try {
      await WhatsAppSessionAPI.create(payload);
      await get().loadSessions(); // Reload sessions after creation
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create session',
        loading: false 
      });
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      await WhatsAppSessionAPI.delete(sessionId);
      await get().loadSessions(); // Reload sessions after deletion
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete session',
        loading: false 
      });
      throw error;
    }
  },

  refreshSessionStatus: async (sessionId: string) => {
    try {
      const status = await WhatsAppSessionAPI.getStatus(sessionId);
      set(state => ({
        sessions: state.sessions.map(session =>
          session.id === sessionId
            ? { ...session, ready: status.ready }
            : session
        )
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to refresh session status'
      });
    }
  },

  getSessionStatus: async (sessionId: string) => {
    try {
      return await WhatsAppSessionAPI.getStatus(sessionId);
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to get session status'
      });
      throw error;
    }
  },

  getQRCode: async (sessionId: string) => {
    try {
      const response = await WhatsAppSessionAPI.getQR(sessionId);
      set({ qrCode: response.qr, selectedSession: sessionId });
      return response.qr;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to get QR code'
      });
      throw error;
    }
  },

  sendMessage: async (sessionId: string, to: string | string[], text: string) => {
    set({ loading: true, error: null });
    try {
      await WhatsAppSessionAPI.sendMessage(sessionId, { to, text });
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to send message',
        loading: false 
      });
      throw error;
    }
  },

  setSelectedSession: (sessionId: string | null) => {
    set({ selectedSession: sessionId });
  },

  setQRCode: (qrCode: string | null) => {
    set({ qrCode });
  },

  clearError: () => {
    set({ error: null });
  },
}));
