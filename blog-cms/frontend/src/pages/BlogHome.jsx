import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function BlogHome() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        const cats = [...new Set(data.map(p => p.category))];
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter(p => p.category === selectedCategory)
    : posts;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary-600">Blog CMS</Link>
            <a href="/admin/dashboard" className="text-sm text-gray-500 hover:text-primary-600 transition">Admin</a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Posts</h1>
          <p className="text-lg text-gray-500">Thoughts, ideas, and insights on web development and technology.</p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map(post => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                className="block bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg hover:border-primary-200 transition-all group"
              >
                {post.featured_image && (
                  <img src={post.featured_image} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-6" />
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{post.category}</span>
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock size={14} />
                    {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition">{post.title}</h2>
                <p className="text-gray-500 leading-relaxed">{post.excerpt}</p>
                <div className="mt-4 text-sm text-gray-400">By {post.author_name}</div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          Built by Gs_Dev
        </div>
      </footer>
    </div>
  );
}