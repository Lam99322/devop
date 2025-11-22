import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

export default function ProfileDropdown() {
  const { user, token, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==========================
  // Fetch đơn hàng của user
  // ==========================
  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/orders/list/user/${user.id}`);
      setOrders(res.data.data.items || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Fetch mã giảm giá (tùy quyền)
  // ==========================
  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/discounts"); // admin mới lấy được
      setDiscounts(res.data.data.items || []);
    } catch (err) {
      console.error("Failed to fetch discounts:", err.response || err);
    } finally {
      setLoading(false);
    }
  };
const handleToggle = () => {
  setOpen(!open);
  if (!open && user) {
    fetchOrders(); // fetch orders
    // fetchDiscounts(); // admin mới fetch
  }
};

  

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="bg-green-500 text-white px-3 py-1 rounded"
      >
        {user.username || user.name} ▼
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 p-4 space-y-4">
          <div>
            <h4 className="font-bold">Thông tin cá nhân</h4>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
          </div>

          <div>
            <h4 className="font-bold">Đơn hàng</h4>
            {loading ? (
              <p>Đang tải...</p>
            ) : orders.length ? (
              <ul className="text-sm max-h-40 overflow-y-auto">
                {orders.map((o) => (
                  <li key={o.id}>
                    #{o.id} - {o.status} - {new Date(o.createdAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có đơn hàng</p>
            )}
          </div>

          <div>
            <h4 className="font-bold">Mã giảm giá</h4>
            {loading ? (
              <p>Đang tải...</p>
            ) : discounts.length ? (
              <ul className="text-sm max-h-40 overflow-y-auto">
                {discounts.map((d) => (
                  <li key={d.id}>
                    {d.code} - {d.value}% - HSD: {new Date(d.expiryDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Không có mã giảm giá</p>
            )}
          </div>

          <button
            onClick={logout}
            className="bg-red-500 text-white w-full py-1 rounded mt-2"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
