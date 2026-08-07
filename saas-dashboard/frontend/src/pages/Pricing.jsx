import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Check, Zap, Building2 } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL || 'https://laudable-charm-production.up.railway.app/api';
const plans = [
  { name: 'Free', desc: 'For getting started', price: { m: 0, y: 0 }, f: ['1,000 API calls/month', '5 GB storage', '1 team member', 'Basic analytics'], icon: Zap },
  { name: 'Pro', desc: 'For growing teams', price: { m: 29, y: 290 }, f: ['50,000 API calls/month', '100 GB storage', '10 team members', 'Advanced analytics', 'Priority support'], pop: true, icon: Zap },
  { name: 'Enterprise', desc: 'For large orgs', price: { m: 99, y: 990 }, f: ['Unlimited API calls', 'Unlimited storage', 'Unlimited team members', 'Enterprise analytics', '24/7 support'], icon: Building2 }
];

export default function Pricing() {
  const [iv, setIv] = useState('m');
  const [ld, setLd] = useState(null);
  const { user } = useAuth();

  const go = async (n) => {
    if (n === 'Free') { toast('Already on Free'); return; }
    setLd(n);
    try {
      const r = await fetch(`${API_URL}/stripe/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ plan: n.toLowerCase(), interval: iv === 'm' ? 'monthly' : 'yearly' }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error); window.location.href = d.url;
    } catch (e) { toast.error(e.message.includes('Stripe') ? 'Stripe not configured' : e.message); } finally { setLd(null); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold">Choose your plan</h1>
        <p className="text-xs text-gray-500 mt-1">No hidden fees. Start free.</p>
        <div className="flex items-center justify-center gap-2 mt-5">
          <span className={`text-xs font-semibold ${iv === 'm' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button onClick={() => setIv(iv === 'm' ? 'y' : 'm')} className={`relative w-9 h-5 rounded-full transition-colors ${iv === 'y' ? 'bg-gray-900' : 'bg-gray-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${iv === 'y' ? 'translate-x-4' : 'translate-x-0.5'}`} /></button>
          <span className={`text-xs font-semibold ${iv === 'y' ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
          {iv === 'y' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Save 17%</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-lg p-[1px] ${p.pop ? 'bg-gray-900' : 'bg-gray-200'}`}>
            <div className="h-full bg-white rounded-lg p-5">
              {p.pop && <div className="text-[9px] font-bold text-white bg-gray-900 px-1.5 py-0.5 rounded mb-2 inline-block">POPULAR</div>}
              <h3 className="text-base font-bold">{p.name}</h3><p className="text-[11px] text-gray-500 mb-3">{p.desc}</p>
              <div className="flex items-baseline gap-0.5 mb-0.5"><span className="text-2xl font-bold">${p.price[iv]}</span><span className="text-xs text-gray-400">/{iv === 'm' ? 'mo' : 'yr'}</span></div>
              <p className="text-[10px] text-gray-400 mb-4">{iv === 'm' ? 'billed monthly' : 'billed yearly'}</p>
              <ul className="space-y-2 mb-5">{p.f.map((f) => <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600"><Check className="w-3 h-3 text-green-600 flex-shrink-0" />{f}</li>)}</ul>
              <button onClick={() => go(p.name)} disabled={ld === p.name} className={`w-full py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${p.pop ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300'}`}>{ld === p.name ? '...' : p.name === 'Free' ? 'Get started' : 'Start trial'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
