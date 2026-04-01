"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Quote {
  id: string;
  quoteNumber: string;
  customer: { companyName: string };
  user: { name: string };
  totalAmount: string;
  status: string;
  validUntil: string;
  createdAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-gray-100 text-gray-700" },
  sent: { label: "已送出", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "已接受", color: "bg-green-100 text-green-700" },
  rejected: { label: "已拒絕", color: "bg-red-100 text-red-700" },
};

export default function QuotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/quotes")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setQuotes(data); });
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此報價單？")) return;
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    setQuotes(quotes.filter((q) => q.id !== id));
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">報價單管理</h1>
          <button
            onClick={() => router.push("/quotes/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            建立報價單
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">報價單號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客戶</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">總金額</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">有效日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">建立日期</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotes.map((q) => {
                const s = statusLabels[q.status] || statusLabels.draft;
                return (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      <button onClick={() => router.push(`/quotes/${q.id}`)}>{q.quoteNumber}</button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{q.customer.companyName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">NT$ {Number(q.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(q.validUntil).toLocaleDateString("zh-TW")}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(q.createdAt).toLocaleDateString("zh-TW")}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => router.push(`/quotes/${q.id}`)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">檢視</button>
                      <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 text-sm">刪除</button>
                    </td>
                  </tr>
                );
              })}
              {quotes.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">尚無報價單</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
