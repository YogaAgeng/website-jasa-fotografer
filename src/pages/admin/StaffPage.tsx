import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import { StaffAPI } from "../../api/client";
import { Plus, Edit, Trash2, User, Mail, Phone, MapPin, Camera, Palette } from "lucide-react";

type Staff = { 
  id: string; 
  name: string; 
  staffType: 'PHOTOGRAPHER'|'EDITOR'; 
  phone?: string; 
  email?: string; 
  homeBase?: string; 
  active?: number;
};

export default function StaffPage() {
  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Staff>>({ 
    staffType: 'PHOTOGRAPHER', 
    name: '', 
    phone: '', 
    email: '', 
    homeBase: '', 
    active: 1 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await StaffAPI.list();
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data staff');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({ 
      staffType: 'PHOTOGRAPHER', 
      name: '', 
      phone: '', 
      email: '', 
      homeBase: '', 
      active: 1 
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (!form.name?.trim()) {
      setError('Nama staff harus diisi');
      return;
    }
    
    if (!form.staffType) {
      setError('Tipe staff harus dipilih');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await StaffAPI.update(editingId, {
          staffType: form.staffType,
          name: form.name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          homeBase: form.homeBase || undefined,
          active: form.active === 1
        });
      } else {
        await StaffAPI.create({
          staffType: form.staffType,
          name: form.name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          homeBase: form.homeBase || undefined,
          active: form.active === 1
        });
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan data staff');
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(s: Staff) {
    setEditingId(s.id);
    setForm({ 
      staffType: s.staffType, 
      name: s.name, 
      phone: s.phone || '', 
      email: s.email || '', 
      homeBase: s.homeBase || '', 
      active: s.active || 1 
    });
    setShowForm(true);
    setError(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus staff ini?')) return;
    
    setLoading(true);
    setError(null);
    try {
      await StaffAPI.remove(id);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus data staff');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Staff
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Staff' : 'Tambah Staff Baru'}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Nama Staff *
                </label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={form.name || ''} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Masukkan nama staff"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.staffType === 'PHOTOGRAPHER' ? <Camera className="w-4 h-4 inline mr-1" /> : <Palette className="w-4 h-4 inline mr-1" />}
                  Tipe Staff *
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={form.staffType} 
                  onChange={(e) => setForm({ ...form, staffType: e.target.value as any })}
                >
                  <option value="PHOTOGRAPHER">📸 Photographer</option>
                  <option value="EDITOR">🎨 Editor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Nomor Telepon
                </label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={form.phone || ''} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Contoh: +6281234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input 
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={form.email || ''} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="staff@example.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Home Base
                </label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={form.homeBase || ''} 
                  onChange={(e) => setForm({ ...form, homeBase: e.target.value })}
                  placeholder="Lokasi home base staff"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="secondary"
                onClick={resetForm}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                loading={loading}
                disabled={!form.name?.trim() || !form.staffType}
              >
                {editingId ? 'Update Staff' : 'Tambah Staff'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Staff</h3>
        </div>
        
        {loading && items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Memuat data staff...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada staff yang terdaftar</p>
            <p className="text-sm">Klik tombol "Tambah Staff" untuk menambahkan staff baru</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Home Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {s.staffType === 'PHOTOGRAPHER' ? (
                              <Camera className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Palette className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        s.staffType === 'PHOTOGRAPHER' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {s.staffType === 'PHOTOGRAPHER' ? '📸 Photographer' : '🎨 Editor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {s.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {s.phone}
                          </div>
                        )}
                        {s.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-3 h-3 mr-1" />
                            {s.email}
                          </div>
                        )}
                        {!s.phone && !s.email && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {s.homeBase ? (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {s.homeBase}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        s.active === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {s.active === 1 ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleEdit(s)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleDelete(s.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}