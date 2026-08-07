import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, Users, HardDrive, TrendingUp, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL || 'https://laudable-charm-production.up.railway.app/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await fetch(`${API_URL}/subscriptions/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); if (r.ok) setSub(await r.json()); } catch {} finally { setLoading(false); }
    })();
  }, []);

  const pct = (u, t) => (!t || t === -1) ? 10 : Math.min((u / t) * 100, 100);

  const stats = [
    { label: 'API Calls', value: sub?.usage?.apiCalls?.toLocaleString() || '0', limit: sub?.limits?.apiCalls === -1 ? 'Unlimited' : `of ${sub?.limits?.apiCalls?.toLocaleString()}`, icon: Activity, change: '+12.5%', up: true },
    { label: 'Storage', value: `${sub?.usage?.storage || 0} GB`, limit: sub?.limits?.storage === -1 ? 'Unlimited' : `of ${sub?.limits?.storage} GB`, icon: HardDrive, change: '+8.2%', up: true },
    { label: 'Team', value: sub?.usage?.teamMembers || 1, limit: sub?.limits?.teamMembers === -1 ? 'Unlimited' : `of ${sub?.limits?.teamMembers}`, icon: Users, change: '+2', up: true },
    { label: 'Uptime', value: '99.9%', limit: 'Last 30 days', icon: TrendingUp, change: '+0.1%', up: true }
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div><h1 className="text-lg font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1><p className="text-xs text-gray-500">Account overview</p></div>
        {sub?.plan === 'free' && <Link to="/pricing" className="btn-primary text-xs inline-flex items-center gap-1"><Zap className="w-3 h-3" /> Upgrade</Link>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, limit, icon: Icon, change, up }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-gray-600" /></div>
              <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-green-600' : 'text-red-600'}`}>{up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{change}</span>
            </div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-[11px] text-gray-500">{label}</p>
            <p className="text-[10px] text-gray-400">{limit}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Current Plan</h2>
            {sub?.plan !== 'free' && <span className="badge-green">Active</span>}
          </div>
          <div className="flex items-center gap-3 mb-4 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center"><span className="text-xs font-bold text-white uppercase">{sub?.plan?.charAt(0)}</span></div>
            <div><p className="text-xs font-bold capitalize">{sub?.plan} Plan</p><p className="text-[10px] text-gray-500">{sub?.plan === 'free' ? 'Free forever' : '$29/month'}</p></div>
          </div>
          <div className="space-y-2.5">
            <div><div className="flex justify-between text-[11px] mb-1"><span className="text-gray-500">API Usage</span><span className="font-semibold">{Math.round(pct(sub?.usage?.apiCalls || 0, sub?.limits?.apiCalls))}%</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-gray-900 h-1.5 rounded-full transition-all" style={{ width: `${pct(sub?.usage?.apiCalls || 0, sub?.limits?.apiCalls)}%` }} /></div></div>
            <div><div className="flex justify-between text-[11px] mb-1"><span className="text-gray-500">Storage</span><span className="font-semibold">{Math.round(pct(sub?.usage?.storage || 0, sub?.limits?.storage))}%</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-gray-900 h-1.5 rounded-full transition-all" style={{ width: `${pct(sub?.usage?.storage || 0, sub?.limits?.storage)}%` }} /></div></div>
          </div>
          {sub?.plan === 'free' && <Link to="/pricing" className="btn-primary w-full mt-4 flex items-center justify-center gap-1 text-xs"><Zap className="w-3 h-3" /> Upgrade to Pro</Link>}
        </div>

        <div className="lg:col-span-2 card">
          <h2 className="text-sm font-bold mb-3">Recent Activity</h2>
          <div className="space-y-2.5">
            {[
              { a: 'API call completed', d: 'GET /api/v1/users', t: '2m ago', c: '#3b82f6' },
              { a: 'File uploaded', d: 'report-q4.pdf', t: '1h ago', c: '#a855f7' },
              { a: 'Member invited', d: 'sarah@company.com', t: '3h ago', c: '#22c55e' },
              { a: 'Settings updated', d: 'Profile name', t: '5h ago', c: '#f59e0b' },
              { a: 'Plan started', d: 'Free plan', t: '1d ago', c: '#9ca3af' }
            ].map(({ a, d, t, c }, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold">{a}</p><p className="text-[10px] text-gray-500 truncate">{d}</p></div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
