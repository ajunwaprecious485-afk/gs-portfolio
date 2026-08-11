import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, Clock, FolderOpen, TrendingUp, Eye, Calendar, ArrowUpRight, Plus, BarChart3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/posts/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/posts/all`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([statsData, postsData]) => {
      setStats(statsData);
      setRecentPosts(postsData.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Posts', value: stats?.total || 0, icon: FileText, gradient: 'from-violet-500 to-purple-600', change: '+12%' },
    { label: 'Published', value: stats?.published || 0, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600', change: '+8%' },
    { label: 'Drafts', value: stats?.drafts || 0, icon: Clock, gradient: 'from-amber-500 to-orange-600', change: '0%' },
    { label: 'Categories', value: stats?.categories?.length || 0, icon: FolderOpen, gradient: 'from-blue-500 to-cyan-600', change: '+2' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name} 👋</h1>
          <p className="text-primary-100 text-lg">Here's what's happening with your blog today.</p>
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center gap-2 mt-6 bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg"
          >
            <Plus size={18} /> Create New Post
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, gradient, change }, index) => (
          <div
            key={label}
            className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-dark-100 dark:border-dark-700 hover:shadow-xl transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-dark-500 dark:text-dark-400">{label}</p>
                <p className="text-3xl font-bold text-dark-900 dark:text-white mt-2">{value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-emerald-500 font-medium">{change}</span>
              <span className="text-dark-400 ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-dark-100 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/admin/posts/new" className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition group">
              <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-lg group-hover:scale-110 transition">
                <Plus size={18} />
              </div>
              <span className="font-medium">Write New Post</span>
              <ArrowUpRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
            </Link>
            <Link to="/admin/posts" className="flex items-center gap-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-600 transition group">
              <div className="p-2 bg-dark-200 dark:bg-dark-600 rounded-lg group-hover:scale-110 transition">
                <FileText size={18} />
              </div>
              <span className="font-medium">Manage Posts</span>
              <ArrowUpRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
            </Link>
            <Link to="/admin/media" className="flex items-center gap-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-600 transition group">
              <div className="p-2 bg-dark-200 dark:bg-dark-600 rounded-lg group-hover:scale-110 transition">
                <BarChart3 size={18} />
              </div>
              <span className="font-medium">View Analytics</span>
              <ArrowUpRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl p-6 border border-dark-100 dark:border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Recent Posts</h3>
            <Link to="/admin/posts" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4" />
              <p className="text-dark-500 mb-4">No posts yet</p>
              <Link to="/admin/posts/new" className="text-primary-600 font-medium hover:underline">Create your first post</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-700 transition group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-500/20 dark:to-primary-600/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-900 dark:text-white truncate group-hover:text-primary-600 transition">{post.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-dark-400">{post.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-500">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      {stats?.categories?.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-dark-100 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {stats.categories.map((cat, i) => (
              <span key={cat} className="px-5 py-2.5 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-500/10 dark:to-purple-500/10 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-500/20">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}