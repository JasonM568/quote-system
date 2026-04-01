"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Service {
  id: string;
  name: string;
  specification: string | null;
  unitPrice: string;
  description: string | null;
}

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", specification: "", unitPrice: "", description: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadServices = async () => {
    const res = await fetch("/api/services");
    if (res.ok) setServices(await res.json());
  };

  useEffect(() => {
    if (session) loadServices();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/services/${editingId}` : "/api/services";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, unitPrice: parseFloat(form.unitPrice) }),
    });

    if (res.ok) {
      setForm({ name: "", specification: "", unitPrice: "", description: "" });
      setShowForm(false);
      setEditingId(null);
      loadServices();
    }
  };

  const handleEdit = (service: Service) => {
    setForm({
      name: service.name,
      specification: service.specification || "",
      unitPrice: service.unitPrice,
      description: service.description || "",
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此服務項目？")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    loadServices();
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">服務項目管理</h1>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", specification: "", unitPrice: "", description: "" }); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新增服務項目
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">{editingId ? "編輯" : "新增"}服務項目</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">服務名稱 *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">單價 *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">規格</label>
                <input
                  value={form.specification}
                  onChange={(e) => setForm({ ...form, specification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  {editingId ? "更新" : "新增"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">規格</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">單價</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.specification || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">NT$ {Number(s.unitPrice).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.description || "-"}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">編輯</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-sm">刪除</button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">尚無服務項目</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
