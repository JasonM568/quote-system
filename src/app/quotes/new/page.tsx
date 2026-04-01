"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Service { id: string; name: string; specification: string | null; unitPrice: string; }
interface Customer { id: string; companyName: string; contactPerson: string; }
interface QuoteItem { serviceId: string; name: string; specification: string; unitPrice: number; quantity: number; }

export default function NewQuotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("5");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/services").then((r) => r.json()).then(setServices);
      fetch("/api/customers").then((r) => r.json()).then(setCustomers);
      // Default valid until: 30 days from now
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setValidUntil(d.toISOString().slice(0, 10));
    }
  }, [session]);

  const addItem = () => {
    setItems([...items, { serviceId: "", name: "", specification: "", unitPrice: 0, quantity: 1 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    (updated[index] as unknown as Record<string, string | number>)[field] = value;
    setItems(updated);
  };

  const selectService = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      const updated = [...items];
      updated[index] = {
        serviceId: service.id,
        name: service.name,
        specification: service.specification || "",
        unitPrice: Number(service.unitPrice),
        quantity: updated[index].quantity,
      };
      setItems(updated);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountedSubtotal = subtotal * (1 - Number(discount) / 100);
  const taxAmount = discountedSubtotal * (Number(taxRate) / 100);
  const total = discountedSubtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0) {
      alert("請選擇客戶並至少新增一個項目");
      return;
    }
    setSaving(true);

    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        discount: Number(discount),
        taxRate: Number(taxRate),
        validUntil,
        notes,
        items,
      }),
    });

    if (res.ok) {
      const quote = await res.json();
      router.push(`/quotes/${quote.id}`);
    } else {
      alert("建立失敗，請重試");
      setSaving(false);
    }
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">建立報價單</h1>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客戶 *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">選擇客戶</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">折扣 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">稅率 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">有效日期 *</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">報價項目</h2>
              <button
                type="button"
                onClick={addItem}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
              >
                + 新增項目
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-400 text-center py-8">請點擊「新增項目」加入報價項目</p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-4">
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">選擇服務</label>
                      <select
                        value={item.serviceId}
                        onChange={(e) => selectService(index, e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      >
                        <option value="">自訂項目</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">名稱</label>
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">規格</label>
                      <input
                        value={item.specification}
                        onChange={(e) => updateItem(index, "specification", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">單價</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">數量</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right"
                        required
                      />
                    </div>
                    <div className="col-span-1 text-right text-sm font-medium text-gray-700 pb-1">
                      NT$ {(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                    <div className="col-span-1 pb-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {items.length > 0 && (
              <div className="mt-6 pt-4 border-t space-y-2 text-right">
                <p className="text-sm text-gray-600">小計：NT$ {subtotal.toLocaleString()}</p>
                {Number(discount) > 0 && (
                  <p className="text-sm text-gray-600">折扣 ({discount}%)：-NT$ {(subtotal - discountedSubtotal).toLocaleString()}</p>
                )}
                <p className="text-sm text-gray-600">稅額 ({taxRate}%)：NT$ {Math.round(taxAmount).toLocaleString()}</p>
                <p className="text-xl font-bold text-gray-900">合計：NT$ {Math.round(total).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "建立中..." : "建立報價單"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
