import { useState, useEffect } from 'react';
import { useWhatsAppSessionStore } from '../../store/whatsappSessions';
import type { WhatsAppSession, CreateSessionDto } from '../../api/whatsappTypes';
import Button from '../ui/Button';
import SessionForm from './SessionForm';
import SessionCard from './SessionCard';
import SendMessageModal from './SendMessageModal';
import { MessageCircle, Plus, RefreshCw, AlertCircle } from 'lucide-react';

export default function WhatsAppManager() {
  const {
    sessions,
    loading,
    error,
    loadSessions,
    createSession,
    deleteSession,
    refreshSessionStatus,
    getQRCode,
    sendMessage,
    selectedSession,
    qrCode,
    setSelectedSession,
    setQRCode,
    clearError
  } = useWhatsAppSessionStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSession, setEditingSession] = useState<WhatsAppSession | null>(null);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreateSession = async (data: CreateSessionDto) => {
    try {
      await createSession(data);
      setShowCreateForm(false);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleEditSession = (session: WhatsAppSession) => {
    setEditingSession(session);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleRefreshSession = async (sessionId: string) => {
    try {
      await refreshSessionStatus(sessionId);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleGetQR = async (sessionId: string) => {
    try {
      await getQRCode(sessionId);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleSendMessage = async (sessionId: string, to: string | string[], text: string) => {
    try {
      setSendingMessage(true);
      await sendMessage(sessionId, to, text);
      setShowSendMessage(false);
    } catch (error) {
      // Error is handled by the store
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseQR = () => {
    setQRCode(null);
    setSelectedSession(null);
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          WhatsApp Manager
        </h2>
        <div className="flex gap-2">
          <Button
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadSessions}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Create Session Form */}
      {showCreateForm && (
        <SessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setShowCreateForm(false)}
          loading={loading}
        />
      )}

      {/* Edit Session Form */}
      {editingSession && (
        <SessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setEditingSession(null)}
          loading={loading}
          initialData={{
            sessionId: editingSession.id,
            deviceType: editingSession.deviceType || 'android'
          }}
        />
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-500 mb-4">
              Create your first WhatsApp session to start managing messages.
            </p>
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateForm(true)}
            >
              Create First Session
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRefresh={handleRefreshSession}
                onGetQR={handleGetQR}
                onDelete={handleDeleteSession}
                onEdit={handleEditSession}
                onSendMessage={(sessionId) => {
                  setSelectedSession(sessionId);
                  setShowSendMessage(true);
                }}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrCode && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">WhatsApp QR Code</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseQR}
              >
                ×
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Scan this QR code with WhatsApp to connect session: <strong>{selectedSession}</strong>
              </p>
              <div className="flex justify-center mb-4">
                <img 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleCloseQR}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleRefreshSession(selectedSession)}
                >
                  Check Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showSendMessage && selectedSession && (
        <SendMessageModal
          sessionId={selectedSession}
          isOpen={showSendMessage}
          onClose={() => setShowSendMessage(false)}
          onSend={handleSendMessage}
          loading={sendingMessage}
        />
      )}
    </div>
  );
}
