import { useState } from 'react';
import type { WhatsAppSession } from '../../api/whatsappTypes';
import Button from '../ui/Button';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  QrCode, 
  Trash2, 
  Edit, 
  MessageCircle,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';

interface SessionCardProps {
  session: WhatsAppSession;
  onRefresh: (sessionId: string) => void;
  onGetQR: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onEdit?: (session: WhatsAppSession) => void;
  onSendMessage?: (sessionId: string) => void;
  loading?: boolean;
}

export default function SessionCard({ 
  session, 
  onRefresh, 
  onGetQR, 
  onDelete, 
  onEdit,
  onSendMessage,
  loading = false 
}: SessionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'android':
      case 'ios':
        return <Smartphone className="w-4 h-4" />;
      case 'web':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getDeviceColor = (deviceType?: string) => {
    switch (deviceType) {
      case 'android':
        return 'text-green-600';
      case 'ios':
        return 'text-blue-600';
      case 'web':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete session "${session.id}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(session.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              {session.ready ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium text-gray-900">{session.id}</span>
            </div>
            
            <span className={`px-2 py-1 text-xs rounded-full ${
              session.ready 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {session.ready ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              {getDeviceIcon(session.deviceType)}
              <span className={getDeviceColor(session.deviceType)}>
                {session.deviceType || 'Unknown'}
              </span>
            </div>
            
            {session.phoneNumber && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{session.phoneNumber}</span>
              </div>
            )}
          </div>

          {session.name && (
            <p className="text-sm text-gray-700 mb-2">
              <strong>Name:</strong> {session.name}
            </p>
          )}

          {session.lastActive && (
            <p className="text-xs text-gray-500">
              Last active: {new Date(session.lastActive).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RefreshCw className="w-3 h-3" />}
              onClick={() => onRefresh(session.id)}
              disabled={loading}
            >
              Refresh
            </Button>
            
            {!session.ready && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<QrCode className="w-3 h-3" />}
                onClick={() => onGetQR(session.id)}
                disabled={loading}
              >
                QR
              </Button>
            )}
          </div>

          <div className="flex gap-1">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Edit className="w-3 h-3" />}
                onClick={() => onEdit(session)}
                disabled={loading}
              >
                Edit
              </Button>
            )}
            
            {onSendMessage && session.ready && (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<MessageCircle className="w-3 h-3" />}
                onClick={() => onSendMessage(session.id)}
                disabled={loading}
              >
                Send
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Trash2 className="w-3 h-3" />}
              onClick={handleDelete}
              disabled={loading || isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
