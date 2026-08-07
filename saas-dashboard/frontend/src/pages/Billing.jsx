import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, ExternalLink, Download, CheckCircle } from 'lucide-react';
const API_URL = '/api';

export default function Billing() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLd, setPortalLd] = useState(false);

  useEffect(() => { (async () => { try { const r = await fetch(`${API_URL}/subscriptions/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); if (r.ok) setSub(await r.json()); } catch {} finally { setLoading(false); } })(); }, []);

  const portal = async () => {
    setPortalLd(true);
    try { const r = await fetch(`${API_URL}/stripe/portal`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` } }); const d = await r.json(); if (!r.ok) throw new Error(d.error); window.location.href = d.url; } catch (e) { toast.error(e.message); } finally { setPortalLd(false); }
  };

  const sm = { active: ['Active', 'badge-green'], canceled: ['Canceled', 'badge-red'], past_due: ['Past Due', 'badge-amber'], trialing: ['Trial', 'badge-amber'] };
  const inv = [{ id: 'INV-001', date: 'Aug 1, 2026', amt: '$29.00' }, { id: 'INV-002', date: 'Jul 1, 2026', amt: '$29.00' }, { id: 'INV-003', date: 'Jun 1, 2026', amt: '$29.00' }];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent" /></div>;

  const [sl, sc] = sm[sub?.status] || sm.active;

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div><h1 className="text-lg font-bold">Billing</h1><p className="text-xs text-gray-500">Manage subscription and payments</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-bold">Subscription</h2><span className={sc}>{sl}</span></div>
          <div className="flex items-center gap-3 mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center"><CreditCard className="w-4 h-4 text-white" /></div>
            <div><p className="text-xs font-bold capitalize">{sub?.plan} Plan</p><p className="text-[10px] text-gray-500">{sub?.plan === 'free' ? 'No payment' : '$29/month'}</p></div>
          </div>
          {sub?.currentPeriodEnd && <div className="flex justify-between text-[11px] p-2 bg-gray-50 rounded mb-3"><span className="text-gray-500">Period ends</span><span className="font-semibold">{new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>}
          <button onClick={portal} disabled={portalLd || sub?.plan === 'free'} className="btn-primary text-xs inline-flex items-center gap-1 disabled:opacity-50">{portalLd ? 'Opening...' : 'Manage'} <ExternalLink className="w-3 h-3" /></button>
        </div>
        <div className="card">
          <h2 className="text-sm font-bold mb-2">Payment</h2>
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 mb-2"><p className="text-xs font-semibold">{sub?.plan === 'free' ? 'No card' : '•••• 4242'}</p><p className="text-[10px] text-gray-500">{sub?.plan === 'free' ? 'Upgrade to add' : 'Exp 12/2027'}</p></div>
          {sub?.plan !== 'free' && <button onClick={portal} className="btn-secondary w-full text-xs">Update Card</button>}
        </div>
      </div>
      <div className="card">
        <h2 className="text-sm font-bold mb-3">Invoices</h2>
        {sub?.plan === 'free' ? <p className="text-xs text-gray-500 text-center py-6">No invoices yet</p> : (
          <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left pb-2 text-[10px] font-semibold text-gray-500 uppercase">ID</th><th className="text-left pb-2 text-[10px] font-semibold text-gray-500 uppercase">Date</th><th className="text-left pb-2 text-[10px] font-semibold text-gray-500 uppercase">Amount</th><th className="text-left pb-2 text-[10px] font-semibold text-gray-500 uppercase">Status</th><th className="text-right pb-2"></th></tr></thead>
          <tbody className="divide-y divide-gray-50">{inv.map((i) => <tr key={i.id} className="hover:bg-gray-50"><td className="py-2.5 text-xs font-semibold">{i.id}</td><td className="py-2.5 text-xs text-gray-600">{i.date}</td><td className="py-2.5 text-xs font-semibold">{i.amt}</td><td className="py-2.5"><span className="badge-green"><CheckCircle className="w-2.5 h-2.5" /> Paid</span></td><td className="py-2.5 text-right"><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Download className="w-3 h-3" /></button></td></tr>)}</tbody></table>
        )}
      </div>
    </div>
  );
}
