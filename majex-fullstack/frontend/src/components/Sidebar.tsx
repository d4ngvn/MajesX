
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  CreditCard, 
  Calendar, 
  Bell, 
  Shield,
  LogOut,
  QrCode,
  History,
  UserCircle,
  FileWarning,
  Armchair,
  ScanLine
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, isMobileMenuOpen }) => {
  const commonItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Community Chat', icon: MessageSquare },
  ];

  const residentItems = [
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'history', label: 'History', icon: History },
    { id: 'booking', label: 'Services & Booking', icon: Calendar },
    { id: 'qr', label: 'My QR Codes', icon: QrCode },
    { id: 'my-reports', label: 'Report Issue', icon: FileWarning },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  const adminItems = [
    { id: 'residents', label: 'Manage Residents', icon: Users },
    { id: 'amenities', label: 'Amenities', icon: Armchair },
    { id: 'scanner', label: 'Verify Access', icon: ScanLine },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'reports', label: 'Reports Center', icon: Shield },
  ];

  const items = role === UserRole.ADMIN 
    ? [...commonItems, ...adminItems] 
    : [...commonItems, ...residentItems];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      <div className="flex items-center justify-center h-16 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          MajeX
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-slate-700">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'}
            `}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-700 bg-slate-900">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};