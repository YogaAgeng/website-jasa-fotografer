import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { LogOut, User, Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <User className="w-4 h-4" />
          <span>Welcome, {user?.name} ({user?.role})</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* Logout */}
        <Button
          onClick={logout}
          variant="ghost"
          leftIcon={<LogOut className="w-4 h-4" />}
          className="text-gray-600 hover:text-gray-900"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
