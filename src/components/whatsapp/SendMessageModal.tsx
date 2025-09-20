import { useState } from 'react';
import Button from '../ui/Button';
import { X, Send, Users } from 'lucide-react';

interface SendMessageModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSend: (sessionId: string, to: string | string[], text: string) => Promise<void>;
  loading?: boolean;
}

export default function SendMessageModal({ 
  sessionId, 
  isOpen, 
  onClose, 
  onSend, 
  loading = false 
}: SendMessageModalProps) {
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!recipients.trim()) {
      newErrors.recipients = 'Recipients are required';
    } else {
      const phoneNumbers = recipients.split(',').map(phone => phone.trim());
      const invalidNumbers = phoneNumbers.filter(phone => 
        !/^(\+62|62|0)[0-9]{9,13}$/.test(phone)
      );
      
      if (invalidNumbers.length > 0) {
        newErrors.recipients = `Invalid phone numbers: ${invalidNumbers.join(', ')}`;
      }
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
    } else if (message.trim().length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const phoneNumbers = recipients.split(',').map(phone => phone.trim());
      await onSend(sessionId, phoneNumbers, message.trim());
      
      // Reset form on success
      setRecipients('');
      setMessage('');
      setErrors({});
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setRecipients('');
    setMessage('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Send WhatsApp Message</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            leftIcon={<X className="w-4 h-4" />}
          >
            Close
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
              Recipients
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                id="recipients"
                value={recipients}
                onChange={(e) => {
                  setRecipients(e.target.value);
                  if (errors.recipients) {
                    setErrors(prev => ({ ...prev, recipients: '' }));
                  }
                }}
                placeholder="Enter phone numbers separated by commas (e.g., 08123456789, 08123456790)"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.recipients ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
              />
            </div>
            {errors.recipients && (
              <p className="mt-1 text-sm text-red-600">{errors.recipients}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format: 08123456789 or +628123456789 (Indonesian numbers)
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) {
                  setErrors(prev => ({ ...prev, message: '' }));
                }
              }}
              placeholder="Enter your message..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {message.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              leftIcon={<Send className="w-4 h-4" />}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
