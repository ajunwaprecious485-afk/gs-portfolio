import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, PlusCircle, LogOut, Image, Settings, Sun, Moon, Menu, X, ExternalLink } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/posts', label: 'Posts', icon: FileText },
  { to: '/admin/posts/new', label: 'New Post', icon: PlusCircle },
  { to: '/admin/media', label: 'Media', icon: Image },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('blog_dark') === 'true');
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('blog_dark', next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <div className={`flex min-h-screen ${dark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-dark-950 text-white flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white">
                B
              </div>
              <div>
                <h1 className="text-lg font-bold">BlogCMS</h1>
                <p className="text-xs text-dark-400">Pro Dashboard</p>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-dark-800 rounded-lg transition">
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-dark-800 space-y-2">
          <a
            href="/"
            target="_blank"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-400 hover:bg-dark-800 hover:text-white transition ${collapsed ? 'justify-center' : ''}`}
          >
            <ExternalLink size={18} />
            {!collapsed && <span>View Blog</span>}
          </a>
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-dark-50 dark:bg-dark-900">
        {/* Top Bar */}
        <header className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
              {navItems.find(i => location.pathname.startsWith(i.to))?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition"
            >
              {dark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-dark-500" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-dark-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-dark-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}