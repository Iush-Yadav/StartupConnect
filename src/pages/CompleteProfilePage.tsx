import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CompleteProfilePage() {
  const { currentUser, login } = useStore();
  const [form, setForm] = useState({ username: '', userType: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    if (!currentUser) return;
    e.preventDefault();
    await supabase.from('profiles').update({
      username: form.username,
      user_type: form.userType,
    }).eq('id', currentUser.id);
    await login(currentUser.id); // refresh store
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">User Type</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.userType}
            onChange={e => setForm({ ...form, userType: e.target.value })}
            required
          >
            <option value="">Select...</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="investor">Investor</option>
          </select>
        </div>
        <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition">Complete Profile</button>
      </form>
    </div>
  );
} 