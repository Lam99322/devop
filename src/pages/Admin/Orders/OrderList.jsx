// src/pages/Admin/Orders/OrderList.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get("/orders/list");
      setOrders(res.data.data);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = status
    ? orders.filter((o) => o.status === status)
    : orders;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Order Management</h2>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="p-2 border rounded mb-4"
      >
        <option value="">All status</option>
        <option value="PENDING">Pending</option>
        <option value="SHIPPING">Shipping</option>
        <option value="COMPLETED">Completed</option>
      </select>

      <table className="w-full bg-white border rounded shadow-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Order ID</th>
            <th className="p-2">User</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((o) => (
            <tr key={o.id} className="border-b">
              <td className="p-2">{o.id}</td>
              <td className="p-2">{o.user?.username}</td>
              <td className="p-2">{o.totalPrice} đ</td>
              <td className="p-2">{o.status}</td>

              <td className="p-2 text-right">
                <Link
                  to={`/admin/orders/${o.id}`}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
