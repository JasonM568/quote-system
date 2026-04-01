"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ quotes: 0, customers: 0, services: 0 });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      Promise.all([
        fetch("/api/quotes").then((r) => r.json()),
        fetch("/api/customers").then((r) => r.json()),
        fetch("/api/services").then((r) => r.json()),
      ]).then(([quotes, customers, services]) => {
        setStats({
          quotes: Array.isArray(quotes) ? quotes.length : 0,
          customers: Array.isArray(customers) ? customers.length : 0,
          services: Array.isArray(services) ? services.length : 0,
        });
      });
    }
  }, [session]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">歡迎，{session.user.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => router.push("/quotes")}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="text-sm font-medium text-gray-500">報價單總數</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.quotes}</p>
          </div>
          <div
            onClick={() => router.push("/customers")}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="text-sm font-medium text-gray-500">客戶數</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.customers}</p>
          </div>
          <div
            onClick={() => router.push("/services")}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="text-sm font-medium text-gray-500">服務項目</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.services}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
