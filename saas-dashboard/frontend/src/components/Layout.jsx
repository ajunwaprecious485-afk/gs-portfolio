import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CreditCard, Settings, LogOut, Zap, Menu, Bell } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pricing', icon: Zap, label: 'Pricing' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-200 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-4 h-12 border-b border-gray-100">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center"><Zap className="w-3 h-3 text-white" /></div>
            <span className="text-sm font-bold">SaaSly</span>
          </div>
          <nav className="flex-1 px-2.5 py-2.5 space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? 'sidebar-active' : 'sidebar-default'}>
                <Icon className="w-4 h-4" />{label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-gray-100 p-2.5">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center"><span className="text-[10px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-1 text-gray-400 hover:text-red-600 rounded" title="Sign out"><LogOut className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 hover:bg-gray-100 rounded"><Menu className="w-4 h-4 text-gray-600" /></button>
            <div className="flex items-center gap-1.5 lg:hidden"><div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center"><Zap className="w-2.5 h-2.5 text-white" /></div><span className="text-xs font-bold">SaaSly</span></div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded relative"><Bell className="w-4 h-4 text-gray-500" /><span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span></button>
        </header>
        <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
