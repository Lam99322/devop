import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import AdminLayout from "../../layouts/AdminLayout";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axiosClient.get("/orders").then(setOrders).catch(console.error);
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-4">📦 Manage Orders</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Order ID</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td className="border p-2">{o.id}</td>
              <td className="border p-2">{o.user}</td>
              <td className="border p-2">${o.total}</td>
              <td className="border p-2">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
