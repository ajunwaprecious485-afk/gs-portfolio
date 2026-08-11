import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Upload, Image, Copy, Trash2, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Media() {
  const { token } = useAuth();
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('blog_media') || '[]');
    setMedia(stored);
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newMedia = {
        id: Date.now(),
        url: data.url,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        date: new Date().toISOString(),
      };
      const updated = [newMedia, ...media];
      setMedia(updated);
      localStorage.setItem('blog_media', JSON.stringify(updated));
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const removeMedia = (id) => {
    const updated = media.filter(m => m.id !== id);
    setMedia(updated);
    localStorage.setItem('blog_media', JSON.stringify(updated));
    setSelected(null);
    toast.success('Removed');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Media Library</h1>
          <p className="text-dark-500 mt-1">Manage your images and uploads</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
        >
          <Upload size={18} />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {/* Grid */}
      {media.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-6">
            <Image size={32} className="text-dark-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">No media yet</h3>
          <p className="text-dark-500 mb-6">Upload your first image to get started</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition"
          >
            <Upload size={18} /> Upload Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className={`group relative bg-white dark:bg-dark-800 rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                selected?.id === item.id ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-dark-100 dark:border-dark-700'
              }`}
            >
              <div className="aspect-square bg-dark-100 dark:bg-dark-700 overflow-hidden">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-dark-500 mt-1">{item.size}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }} className="p-1.5 bg-white/90 dark:bg-dark-800/90 rounded-lg hover:bg-white dark:hover:bg-dark-700 transition">
                  {copied && selected?.id === item.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); removeMedia(item.id); }} className="p-1.5 bg-white/90 dark:bg-dark-800/90 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Detail */}
      {selected && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-6">
          <div className="flex items-start gap-6">
            <img src={selected.url} alt={selected.name} className="w-40 h-40 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition"><X size={18} /></button>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-dark-500"><span className="text-dark-700 dark:text-dark-300 font-medium">Size:</span> {selected.size}</p>
                <p className="text-dark-500"><span className="text-dark-700 dark:text-dark-300 font-medium">Type:</span> {selected.type}</p>
                <p className="text-dark-500"><span className="text-dark-700 dark:text-dark-300 font-medium">Date:</span> {new Date(selected.date).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => copyUrl(selected.url)} className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-500/20 transition">
                  <Copy size={16} /> Copy URL
                </button>
                <a href={selected.url} target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2 bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 rounded-lg font-medium hover:bg-dark-200 dark:hover:bg-dark-600 transition">
                  Open
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}