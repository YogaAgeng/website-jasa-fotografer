export type WhatsAppSession = {
  id: string;
  ready: boolean;
  createdAt?: string;
  lastActive?: string;
  deviceType?: 'android' | 'ios' | 'web';
  phoneNumber?: string;
  name?: string;
};

export type CreateSessionDto = {
  sessionId?: string;
  deviceType?: 'android' | 'ios' | 'web';
};

export type SessionStatus = {
  ready: boolean;
  qr?: string;
  phoneNumber?: string;
  name?: string;
};

export type SendMessageDto = {
  to: string | string[];
  text: string;
};