import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import { api } from "../../api/client";

type AddOn = { id: string; name: string; price: number; requiresCrew: number };

export default function AddOnsPage() {
  const [items, setItems] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<AddOn>>({ name: '', price: 0, requiresCrew: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/add-ons');
      setItems(data);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/add-ons/${editingId}`, form);
      } else {
        await api.post('/add-ons', form);
      }
      setForm({ name: '', price: 0, requiresCrew: 0 });
      setEditingId(null);
      await load();
    } finally { setLoading(false); }
  }

  async function handleEdit(ao: AddOn) {
    setEditingId(ao.id);
    setForm({ name: ao.name, price: ao.price, requiresCrew: ao.requiresCrew });
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try { await api.delete(`/add-ons/${id}`); await load(); } finally { setLoading(false); }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add-ons</h1>
      <form onSubmit={handleSave} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">Nama</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Harga</label>
            <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={form.price || 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium">Perlu Crew?</label>
            <select className="mt-1 w-full border rounded px-3 py-2 bg-white" value={form.requiresCrew || 0} onChange={(e) => setForm({ ...form, requiresCrew: Number(e.target.value) })}>
              <option value={0}>Tidak</option>
              <option value={1}>Ya</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {editingId && (
            <Button type="button" onClick={() => { setEditingId(null); setForm({ name: '', price: 0, requiresCrew: 0 }); }}>Batal</Button>
          )}
          <Button type="submit" variant="primary" loading={loading}>{editingId ? 'Update' : 'Tambah'}</Button>
        </div>
      </form>

      <div className="bg-white border rounded-xl">
        <div className="grid grid-cols-4 gap-2 px-3 py-2 border-b text-sm font-semibold">
          <div>Nama</div><div>Harga</div><div>Crew</div><div>Aksi</div>
        </div>
        {items.map((a) => (
          <div key={a.id} className="grid grid-cols-4 gap-2 px-3 py-2 border-b text-sm items-center">
            <div>{a.name}</div>
            <div>Rp {a.price.toLocaleString('id-ID')}</div>
            <div>{a.requiresCrew ? 'Ya' : 'Tidak'}</div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" onClick={() => handleEdit(a)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>Hapus</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-3 py-2 text-sm text-slate-500">Belum ada add-on.</div>
        )}
      </div>
    </div>
  );
}


