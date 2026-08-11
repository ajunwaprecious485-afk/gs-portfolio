import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/posts/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => { setPost(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
      <Link to="/" className="text-primary-600 hover:underline">Back to blog</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition">
            <ArrowLeft size={16} /> Back to blog
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {post.featured_image && (
          <img src={post.featured_image} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-xl mb-8" />
        )}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{post.category}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          <span className="flex items-center gap-1"><User size={14} /> {post.author_name}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="blog-content prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }}></div>
      </article>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          Built by Gs_Dev
        </div>
      </footer>
    </div>
  );
}