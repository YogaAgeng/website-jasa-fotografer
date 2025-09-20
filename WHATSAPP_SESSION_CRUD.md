# WhatsApp Session CRUD Documentation

## Overview
Fitur CRUD lengkap untuk mengelola session WhatsApp dalam aplikasi PhotoBooking React. Fitur ini memungkinkan admin dan manager untuk membuat, membaca, mengupdate, dan menghapus session WhatsApp dengan mudah.

## Features

### 1. Create Session
- **Form**: `SessionForm.tsx`
- **API**: `POST /api/session/create`
- **Fitur**:
  - Custom session ID (optional)
  - Device type selection (Android, iOS, Web)
  - Form validation
  - Auto-generate session ID jika tidak diisi

### 2. Read Sessions
- **Component**: `SessionCard.tsx`
- **API**: `GET /api/session/list`
- **Fitur**:
  - List semua session aktif
  - Status connection (Ready/Disconnected)
  - Device type indicator
  - Phone number display (jika tersedia)
  - Last active timestamp

### 3. Update Session
- **Form**: `SessionForm.tsx` (reuse untuk edit)
- **Fitur**:
  - Edit session properties
  - Update device type
  - Refresh session status

### 4. Delete Session
- **API**: `DELETE /api/session/:sessionId`
- **Fitur**:
  - Konfirmasi sebelum hapus
  - Cleanup WhatsApp client
  - Remove dari session map

### 5. Additional Features
- **QR Code Generation**: `GET /api/session/qr`
- **Status Check**: `GET /api/session/status`
- **Send Message**: `POST /api/send-message/:sessionId`
- **Real-time Status Updates**

## Components

### 1. WhatsAppManager.tsx
Main component yang mengintegrasikan semua fitur CRUD:
- Session list management
- Create/Edit forms
- QR code modal
- Send message modal
- Error handling

### 2. SessionForm.tsx
Form component untuk create/edit session:
- Input validation
- Device type selection
- Error display
- Loading states

### 3. SessionCard.tsx
Card component untuk display session:
- Status indicators
- Action buttons
- Device type icons
- Phone number display

### 4. SendMessageModal.tsx
Modal untuk mengirim pesan WhatsApp:
- Multiple recipients support
- Message validation
- Phone number format validation
- Character counter

## State Management

### Zustand Store: `whatsappSessions.ts`
- Centralized state management
- API integration
- Error handling
- Loading states
- UI state (selected session, QR code)

## API Endpoints

```typescript
// List sessions
GET /api/session/list

// Create session
POST /api/session/create
Body: { sessionId?: string, deviceType?: 'android' | 'ios' | 'web' }

// Get session status
GET /api/session/status?id={sessionId}

// Get QR code
GET /api/session/qr?id={sessionId}

// Send message
POST /api/send-message/{sessionId}
Body: { to: string | string[], text: string }

// Delete session
DELETE /api/session/{sessionId}
```

## Usage

### 1. Create New Session
```typescript
const { createSession } = useWhatsAppSessionStore();

await createSession({
  sessionId: 'my-session', // optional
  deviceType: 'android'
});
```

### 2. List Sessions
```typescript
const { sessions, loadSessions } = useWhatsAppSessionStore();

useEffect(() => {
  loadSessions();
}, []);
```

### 3. Send Message
```typescript
const { sendMessage } = useWhatsAppSessionStore();

await sendMessage('session-id', ['08123456789'], 'Hello World!');
```

## Error Handling
- Form validation errors
- API error messages
- Network error handling
- User-friendly error display

## Security
- JWT authentication required
- Role-based access (ADMIN, MANAGER)
- Input validation
- XSS protection

## Dependencies
- React 19.1.1
- Zustand 5.0.8
- Axios 1.11.0
- Lucide React (icons)
- Tailwind CSS (styling)
