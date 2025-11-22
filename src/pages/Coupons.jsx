import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axiosClient.get("/discounts");
        setCoupons(res.data.data.content || []);
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  if (loading) return <div>Đang tải mã giảm giá...</div>;
  if (!coupons.length) return <div>Chưa có mã giảm giá nào</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Mã giảm giá của bạn</h2>
      <ul className="space-y-2">
        {coupons.map((c) => (
          <li key={c.id} className="border rounded px-2 py-1 flex justify-between">
            <span>{c.code}</span>
            <span>{c.discountPercent || c.amount} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
