import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import { StaffAPI } from "../../api/client";

type Staff = { id: string; name: string; staffType: 'PHOTOGRAPHER'|'EDITOR'; phone?: string; email?: string; homeBase?: string; active?: number };

export default function StaffPage() {
  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Staff>>({ staffType: 'PHOTOGRAPHER', name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await StaffAPI.list();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.staffType) return;
    setLoading(true);
    try {
      if (editingId) {
        await fetch(`/staff/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }, body: JSON.stringify(form) });
      } else {
        await fetch('/staff', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }, body: JSON.stringify(form) });
      }
      setForm({ staffType: 'PHOTOGRAPHER', name: '' });
      setEditingId(null);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(s: Staff) {
    setEditingId(s.id);
    setForm({ staffType: s.staffType, name: s.name, phone: s.phone, email: s.email, homeBase: s.homeBase, active: s.active });
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      await fetch(`/staff/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } });
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Staff</h1>

      <form onSubmit={handleSave} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Nama</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Tipe</label>
            <select className="mt-1 w-full border rounded px-3 py-2 bg-white" value={form.staffType} onChange={(e) => setForm({ ...form, staffType: e.target.value as any })}>
              <option value="PHOTOGRAPHER">PHOTOGRAPHER</option>
              <option value="EDITOR">EDITOR</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {editingId && (
            <Button type="button" onClick={() => { setEditingId(null); setForm({ staffType: 'PHOTOGRAPHER', name: '' }); }}>Batal</Button>
          )}
          <Button type="submit" variant="primary" loading={loading}>{editingId ? 'Update' : 'Tambah'}</Button>
        </div>
      </form>

      <div className="bg-white border rounded-xl">
        <div className="grid grid-cols-5 gap-2 px-3 py-2 border-b text-sm font-semibold">
          <div>Nama</div><div>Tipe</div><div>Phone</div><div>Email</div><div>Aksi</div>
        </div>
        {items.map((s) => (
          <div key={s.id} className="grid grid-cols-5 gap-2 px-3 py-2 border-b text-sm items-center">
            <div>{s.name}</div>
            <div>{s.staffType}</div>
            <div>{s.phone || '-'}</div>
            <div>{s.email || '-'}</div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" onClick={() => handleEdit(s)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Hapus</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-3 py-2 text-sm text-slate-500">Belum ada staff.</div>
        )}
      </div>
    </div>
  );
}