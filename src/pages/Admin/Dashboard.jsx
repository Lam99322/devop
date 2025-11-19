import AdminLayout from "../../layouts/AdminLayout";
import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Dashboard() {
  const [stats, setStats] = useState({ books: 0, orders: 0, users: 0 });

  useEffect(() => {
    // Call API real later
    setStats({ books: 120, orders: 245, users: 80 });
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">📊 Admin Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-500 text-white rounded">Books: {stats.books}</div>
        <div className="p-4 bg-green-500 text-white rounded">Orders: {stats.orders}</div>
        <div className="p-4 bg-purple-500 text-white rounded">Users: {stats.users}</div>
      </div>
    </AdminLayout>
  );
}
