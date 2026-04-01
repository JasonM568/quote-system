"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface QuoteDetail {
  id: string;
  quoteNumber: string;
  customer: { companyName: string; taxId: string | null; contactPerson: string; address: string | null; email: string; phone: string | null; };
  user: { name: string; email: string; };
  discount: string;
  taxRate: string;
  validUntil: string;
  status: string;
  notes: string | null;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  createdAt: string;
  items: { id: string; name: string; specification: string | null; unitPrice: string; quantity: number; amount: string; }[];
}

const statusLabels: Record<string, string> = {
  draft: "草稿", sent: "已送出", accepted: "已接受", rejected: "已拒絕",
};

export default function QuoteDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetch(`/api/quotes/${params.id}`)
        .then((r) => r.json())
        .then(setQuote);
    }
  }, [session, params.id]);

  const updateStatus = async (newStatus: string) => {
    const res = await fetch(`/api/quotes/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setQuote((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/quotes/${params.id}/pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${quote?.quoteNumber || "quote"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(false);
    }
  };

  if (status === "loading" || !quote) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{quote.quoteNumber}</h1>
            <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full font-medium ${
              quote.status === "accepted" ? "bg-green-100 text-green-700" :
              quote.status === "rejected" ? "bg-red-100 text-red-700" :
              quote.status === "sent" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {statusLabels[quote.status] || quote.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {downloading ? "產生中..." : "下載 PDF"}
            </button>
            {quote.status === "draft" && (
              <button onClick={() => updateStatus("sent")} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                標記為已送出
              </button>
            )}
            {quote.status === "sent" && (
              <>
                <button onClick={() => updateStatus("accepted")} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  已接受
                </button>
                <button onClick={() => updateStatus("rejected")} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                  已拒絕
                </button>
              </>
            )}
          </div>
        </div>

        {/* Customer & Quote Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-3">客戶資訊</h3>
            <p className="font-semibold text-gray-900">{quote.customer.companyName}</p>
            {quote.customer.taxId && <p className="text-sm text-gray-600">統編：{quote.customer.taxId}</p>}
            <p className="text-sm text-gray-600">聯絡人：{quote.customer.contactPerson}</p>
            <p className="text-sm text-gray-600">{quote.customer.email}</p>
            {quote.customer.address && <p className="text-sm text-gray-600">{quote.customer.address}</p>}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-3">報價資訊</h3>
            <p className="text-sm text-gray-600">建立人：{quote.user.name}</p>
            <p className="text-sm text-gray-600">建立日期：{new Date(quote.createdAt).toLocaleDateString("zh-TW")}</p>
            <p className="text-sm text-gray-600">有效日期：{new Date(quote.validUntil).toLocaleDateString("zh-TW")}</p>
            {quote.notes && <p className="text-sm text-gray-600 mt-2">備註：{quote.notes}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">項目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">規格</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">單價</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">數量</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.specification || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">NT$ {Number(item.unitPrice).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">NT$ {Number(item.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="space-y-2 text-right">
            <p className="text-sm text-gray-600">小計：NT$ {Number(quote.subtotal).toLocaleString()}</p>
            {Number(quote.discount) > 0 && (
              <p className="text-sm text-gray-600">折扣：{quote.discount}%</p>
            )}
            <p className="text-sm text-gray-600">稅額 ({quote.taxRate}%)：NT$ {Number(quote.taxAmount).toLocaleString()}</p>
            <p className="text-xl font-bold text-gray-900">合計：NT$ {Number(quote.totalAmount).toLocaleString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
