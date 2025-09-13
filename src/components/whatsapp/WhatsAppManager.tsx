import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import Button from '../ui/Button';
import { MessageCircle, QrCode, Plus, RefreshCw, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface WhatsAppSession {
  id: string;
  ready: boolean;
}

export default function WhatsAppManager() {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSessionId, setNewSessionId] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/session/list');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!newSessionId.trim()) {
      alert('Please enter a session ID');
      return;
    }

    try {
      setCreating(true);
      await api.post('/api/session/create', { sessionId: newSessionId });
      setNewSessionId('');
      await loadSessions();
      alert('Session created successfully');
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const getSessionStatus = async (sessionId: string) => {
    try {
      const response = await api.get(`/api/session/status?id=${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get session status:', error);
      return { ready: false };
    }
  };

  const getQRCode = async (sessionId: string) => {
    try {
      const response = await api.get(`/api/session/qr?id=${sessionId}`);
      setQrCode(response.data.qr);
      setSelectedSession(sessionId);
    } catch (error) {
      console.error('Failed to get QR code:', error);
      alert('Failed to get QR code');
    }
  };

  const refreshSessionStatus = async (sessionId: string) => {
    const status = await getSessionStatus(sessionId);
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ready: status.ready }
          : session
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          WhatsApp Manager
        </h2>
        <Button
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={loadSessions}
        >
          Refresh
        </Button>
      </div>

      {/* Create New Session */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-3">Create New Session</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter session ID (optional)"
            value={newSessionId}
            onChange={(e) => setNewSessionId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={createSession}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Session'}
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b">
          <h3 className="font-semibold">Active Sessions</h3>
        </div>
        <div className="divide-y">
          {sessions.map((session) => (
            <div key={session.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {session.ready ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">{session.id}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.ready 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {session.ready ? 'Ready' : 'Not Ready'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                  onClick={() => refreshSessionStatus(session.id)}
                >
                  Refresh
                </Button>
                {!session.ready && (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<QrCode className="w-3 h-3" />}
                    onClick={() => getQRCode(session.id)}
                  >
                    Get QR
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No sessions found. Create a new session to get started.
            </div>
          )}
        </div>
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
                onClick={() => {
                  setQrCode(null);
                  setSelectedSession(null);
                }}
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
                  onClick={() => {
                    setQrCode(null);
                    setSelectedSession(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => refreshSessionStatus(selectedSession)}
                >
                  Check Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
