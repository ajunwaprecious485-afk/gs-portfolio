import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, User, Globe, Bell, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Settings() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [blogName, setBlogName] = useState(localStorage.getItem('blog_name') || 'My Blog');
  const [blogDesc, setBlogDesc] = useState(localStorage.getItem('blog_desc') || 'A modern blog powered by BlogCMS');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'blog', label: 'Blog Settings', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const saveProfile = async () => {
    setSaving(true);
    try {
      localStorage.setItem('blog_name', blogName);
      localStorage.setItem('blog_desc', blogDesc);
      toast.success('Settings saved!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Settings</h1>
        <p className="text-dark-500 mt-1">Manage your account and blog preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                  : 'text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Profile Settings</h2>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-dark-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-dark-500">{user?.email}</p>
                  <p className="text-xs text-primary-600 mt-1 capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blog' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Blog Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Blog Name</label>
                  <input type="text" value={blogName} onChange={(e) => setBlogName(e.target.value)} className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Blog Description</label>
                  <textarea value={blogDesc} onChange={(e) => setBlogDesc(e.target.value)} rows={3} className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Notification Preferences</h2>
              <div className="space-y-4">
                {['Email on new comment', 'Email on post published', 'Weekly analytics report', 'Security alerts'].map((item) => (
                  <label key={item} className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-700 rounded-xl cursor-pointer">
                    <span className="text-sm font-medium text-dark-900 dark:text-white">{item}</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-dark-300 dark:bg-dark-600 rounded-full peer peer-checked:bg-primary-600 transition"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Current Password</label>
                  <input type="password" className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">New Password</label>
                  <input type="password" className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Confirm New Password</label>
                  <input type="password" className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" placeholder="Confirm new password" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-dark-100 dark:border-dark-700 flex justify-end">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}