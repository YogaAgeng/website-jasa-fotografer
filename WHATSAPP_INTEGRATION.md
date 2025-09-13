# WhatsApp API Gateway Integration

This document describes the integration of WhatsApp API gateway functionality into the Photo Booking React application, based on the [wa-api-gateway](https://github.com/syauqqii/wa-api-gateway) implementation.

## Features Implemented

### 1. Multi-Session WhatsApp Management
- Create and manage multiple WhatsApp sessions
- QR code generation for session authentication
- Session status monitoring
- Session list management

### 2. Payment Invoice Integration
- Send payment confirmations via WhatsApp
- Generate formatted invoice messages
- Support for both single and multiple recipients
- Fallback to WhatsApp Web if API is not ready

### 3. Booking Invoice Integration
- Send booking confirmations via WhatsApp
- Generate detailed booking information messages
- Real-time WhatsApp status checking

## API Endpoints

### Session Management
- `POST /api/session/create` - Create new WhatsApp session
- `GET /api/session/list` - Get all active sessions
- `GET /api/session/status?id=:sessionId` - Get session status
- `GET /api/session/qr?id=:sessionId` - Get QR code for session

### Message Sending
- `POST /api/send-message/:sessionId` - Send message via specific session
- `POST /wa/send` - Send message via default session (legacy)

### Status Checking
- `GET /wa/status` - Check default session status (legacy)

## Frontend Components

### 1. WhatsAppIntegration.tsx
Main component for sending WhatsApp messages with:
- Status checking (ready/not ready)
- QR code display for authentication
- Message preview
- Fallback to WhatsApp Web

### 2. PaymentInvoiceModal.tsx
Modal for payment invoice management with:
- Payment details display
- Booking information
- WhatsApp integration for sending confirmations
- Formatted message generation

### 3. WhatsAppManager.tsx
Admin interface for managing WhatsApp sessions with:
- Session creation
- Status monitoring
- QR code display
- Session management

## Usage

### 1. Setting Up WhatsApp Sessions

1. Navigate to `/admin/whatsapp`
2. Create a new session (optional: provide custom session ID)
3. Click "Get QR" to display QR code
4. Scan QR code with WhatsApp mobile app
5. Wait for status to show "Ready"

### 2. Sending Payment Confirmations

1. Go to `/admin/payments`
2. Click "Invoice" or "WhatsApp" button on any payment
3. Review the generated message
4. Click "Send via WhatsApp" to send confirmation

### 3. Sending Booking Confirmations

1. Go to `/admin/bookings`
2. Click "Invoice" button on any booking
3. Review the generated message
4. Click "Send via WhatsApp" to send confirmation

## Message Templates

### Payment Confirmation Template
```
💰 *PAYMENT CONFIRMATION*

*Payment Details:*
• Payment ID: [ID]
• Amount: Rp [AMOUNT]
• Method: [METHOD]
• Paid At: [DATE]

*Booking Information:*
• Client: [CLIENT_NAME]
• Date: [BOOKING_DATE]
• Time: [BOOKING_TIME]
• Location: [LOCATION]

*Status:* Payment Received ✅

Thank you for your payment! Your booking is confirmed.

*Photo Booking System* 📸
```

### Booking Confirmation Template
```
📋 *INVOICE HYUGA PHOTO*

*Booking Details:*
• ID: [BOOKING_ID]
• Title: [TITLE]
• Client: [CLIENT_NAME]
• Status: [STATUS]

*Schedule:*
• Date: [DATE]
• Time: [START_TIME] - [END_TIME]
• Duration: [DURATION]

*Staff Assignment:*
• [STAFF_TYPE]: [STAFF_NAME]

*Location:*
• [LOCATION]

*Note:* This is an automated invoice from Photo Booking System.

Terima kasih sudah mempercayakan jasa kami, Have a nice day! 📸
```

## Configuration

### Environment Variables
The server uses the following environment variables:
- `JWT_SECRET` - Secret for JWT token validation
- `DB_HOST` - Database host (default: 127.0.0.1)
- `DB_USER` - Database user (default: root)
- `DB_PASS` - Database password (default: empty)
- `DB_NAME` - Database name (default: schema)

### Dependencies
- `whatsapp-web.js` - WhatsApp Web API
- `qrcode` - QR code generation
- `express` - Web framework
- `cors` - CORS middleware
- `jsonwebtoken` - JWT handling

## Error Handling

The integration includes comprehensive error handling:
- Session not found errors
- WhatsApp not ready errors
- Network connectivity issues
- Fallback to WhatsApp Web when API fails

## Security

- All endpoints require authentication (JWT token)
- Only ADMIN and MANAGER roles can access WhatsApp features
- Session management is isolated per user
- QR codes are generated securely

## Troubleshooting

### Common Issues

1. **WhatsApp not connecting**
   - Check if QR code is scanned correctly
   - Ensure WhatsApp mobile app is updated
   - Try refreshing the session status

2. **Messages not sending**
   - Verify WhatsApp session is ready
   - Check phone number format (should start with 62 for Indonesia)
   - Ensure message content is not empty

3. **QR code not displaying**
   - Check browser console for errors
   - Verify server is running and accessible
   - Try refreshing the page

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Future Enhancements

- Media file support (images, documents)
- Message templates management
- Bulk messaging capabilities
- Message history tracking
- Advanced session management
- Webhook support for message status updates
