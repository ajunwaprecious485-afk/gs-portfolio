import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Lock, Save, Trash2 } from 'lucide-react';
const API_URL = '/api';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [ld, setLd] = useState(false);
  const [del, setDel] = useState(false);

  useEffect(() => { if (user) { setName(user.name || ''); setEmail(user.email || ''); } }, [user]);

  const save = async (e) => { e.preventDefault(); setLd(true); try { const r = await fetch(`${API_URL}/users/me`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ name }) }); if (!r.ok) throw new Error('Failed'); toast.success('Updated'); } catch (e) { toast.error(e.message); } finally { setLd(false); } };
  const pw = (e) => { e.preventDefault(); if (newPw.length < 6) { toast.error('Min 6 chars'); return; } toast.success('Password updated'); setCurPw(''); setNewPw(''); };

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <div><h1 className="text-lg font-bold">Settings</h1><p className="text-xs text-gray-500">Manage your account</p></div>
      <div className="card">
        <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center"><User className="w-3.5 h-3.5 text-gray-600" /></div><div><h2 className="text-sm font-bold">Profile</h2><p className="text-[10px] text-gray-500">Personal info</p></div></div>
        <form onSubmit={save} className="space-y-3">
          <div><label className="label">Name</label><input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label className="label">Email</label><input type="email" className="input bg-gray-50" value={email} disabled /></div>
          <div className="flex justify-end"><button type="submit" disabled={ld} className="btn-primary text-xs inline-flex items-center gap-1 disabled:opacity-50"><Save className="w-3 h-3" />{ld ? 'Saving...' : 'Save'}</button></div>
        </form>
      </div>
      <div className="card">
        <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center"><Lock className="w-3.5 h-3.5 text-gray-600" /></div><div><h2 className="text-sm font-bold">Password</h2><p className="text-[10px] text-gray-500">Update password</p></div></div>
        <form onSubmit={pw} className="space-y-3">
          <div><label className="label">Current</label><input type="password" className="input" placeholder="••••••••" value={curPw} onChange={(e) => setCurPw(e.target.value)} required /></div>
          <div><label className="label">New</label><input type="password" className="input" placeholder="••••••••" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={6} /></div>
          <div className="flex justify-end"><button type="submit" className="btn-secondary text-xs inline-flex items-center gap-1"><Lock className="w-3 h-3" />Update</button></div>
        </form>
      </div>
      <div className="card border-red-200">
        <div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 bg-red-50 rounded flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-600" /></div><div><h2 className="text-sm font-bold">Danger Zone</h2><p className="text-[10px] text-gray-500">Permanent</p></div></div>
        {!del ? <button onClick={() => setDel(true)} className="btn-danger text-xs inline-flex items-center gap-1"><Trash2 className="w-3 h-3" />Delete</button> : <div className="bg-red-50 rounded p-2.5 border border-red-200"><p className="text-[11px] text-red-700 mb-2">Cannot be undone</p><div className="flex gap-1.5"><button onClick={() => setDel(false)} className="btn-secondary text-[11px]">Cancel</button><button className="btn-danger text-[11px]">Delete</button></div></div>}
      </div>
    </div>
  );
}
