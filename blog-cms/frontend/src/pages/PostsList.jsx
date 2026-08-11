import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, Search, Filter, MoreVertical, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PostsList() {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchPosts = () => {
    fetch(`${API_URL}/posts/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Post deleted');
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Posts</h1>
          <p className="text-dark-500 mt-1">{posts.length} total posts</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25"
        >
          <Plus size={18} /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div className="flex bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl overflow-hidden">
          {['all', 'published', 'draft'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 text-sm font-medium capitalize transition ${
                filter === f ? 'bg-primary-600 text-white' : 'text-dark-500 hover:bg-dark-50 dark:hover:bg-dark-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-6">
            <Eye size={32} className="text-dark-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">No posts found</h3>
          <p className="text-dark-500 mb-6">
            {search ? 'Try a different search term' : filter !== 'all' ? `No ${filter} posts` : 'Create your first post'}
          </p>
          <Link to="/admin/posts/new" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition">
            <Plus size={18} /> Create Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <div key={post.id} className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {post.featured_image ? (
                <div className="h-48 overflow-hidden">
                  <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <span className="text-5xl opacity-50">📝</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium">{post.category}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.status === 'published' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <h3 className="font-semibold text-dark-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition">{post.title}</h3>
                <p className="text-sm text-dark-500 line-clamp-2 mb-4">{post.excerpt || 'No excerpt'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-dark-100 dark:border-dark-700">
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <Calendar size={14} />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    {post.status === 'published' && (
                      <a href={`/post/${post.slug}`} target="_blank" className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition">
                        <Eye size={16} />
                      </a>
                    )}
                    <Link to={`/admin/posts/edit/${post.id}`} className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => deletePost(post.id)} className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}