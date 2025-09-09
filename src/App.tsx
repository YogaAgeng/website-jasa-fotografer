import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoutes from './routes/AdminRoutes';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/calendar" replace />} />
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
            <AdminRoutes />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;