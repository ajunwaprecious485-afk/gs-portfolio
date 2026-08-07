import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await login(email, password); toast.success('Welcome back'); navigate('/dashboard'); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1.5 mb-8">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center"><Zap className="w-3 h-3 text-white" /></div>
            <span className="text-base font-bold">SaaSly</span>
          </Link>
          <h1 className="text-xl font-bold mb-0.5">Welcome back</h1>
          <p className="text-xs text-gray-500 mb-6">Sign in to your account</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="label">Email</label><input type="email" className="input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><label className="label">Password</label><input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-1">
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <>Sign in <ArrowRight className="w-3 h-3" /></>}
            </button>
          </form>
          <p className="text-center mt-5 text-xs text-gray-500">No account? <Link to="/register" className="font-semibold text-gray-900">Create one</Link></p>
        </div>
      </div>
      <div className="hidden lg:block lg:flex-1 relative bg-gray-900">
        <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 flex items-center p-12"><div className="text-white max-w-xs"><h2 className="text-2xl font-bold mb-2">Build faster</h2><p className="text-white/60 text-sm leading-relaxed">Complete subscription dashboard with Stripe, analytics, and portal.</p></div></div>
      </div>
    </div>
  );
}
