import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminTimelineCalendar from './components/calendar/AdminTimelineCalendar.tsx';
import Button from './components/ui/Button';
import { LogOut, User } from 'lucide-react';

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Photo Booking Dashboard</h1>
          <div className="flex items-center gap-2 text-blue-100">
            <User className="w-4 h-4" />
            <span>Welcome, {user?.name} ({user?.role})</span>
          </div>
        </div>
        <Button 
          onClick={logout}
          className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-400/50 hover:border-red-400 backdrop-blur-sm transition-all duration-300 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
      <AdminTimelineCalendar />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
        <DashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;