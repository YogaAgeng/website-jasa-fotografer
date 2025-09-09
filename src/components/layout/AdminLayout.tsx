import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const getPageTitle = (pathname: string) => {
    const titles: Record<string, string> = {
      '/admin/calendar': 'Calendar Dashboard',
      '/admin/bookings': 'Bookings Management',
      '/admin/staff': 'Staff Management',
      '/admin/clients': 'Clients Management',
      '/admin/packages': 'Packages Management',
      '/admin/reports': 'Reports & Analytics',
      '/admin/settings': 'Settings',
      '/admin/help': 'Help & Support',
    };
    return titles[pathname] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <div className="flex-1 flex flex-col">
        <Header title={getPageTitle(location.pathname)} />
        
        <main className="flex-1 p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
