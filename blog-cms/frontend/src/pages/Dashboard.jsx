import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, Clock, FolderOpen } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/posts/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [token]);

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  const cards = [
    { label: 'Total Posts', value: stats.total, icon: FileText, color: 'bg-primary-500' },
    { label: 'Published', value: stats.published, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Drafts', value: stats.drafts, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Categories', value: stats.categories?.length || 0, icon: FolderOpen, color: 'bg-blue-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${color} text-white`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {stats.categories?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map(cat => (
              <span key={cat} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{cat}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}