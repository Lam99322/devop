import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/orders/${id}`);
      setOrder(res.data.data);
      setStatus(res.data.data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, [id]);

  const changeStatus = async (next) => {
    if (!confirm(`Đổi trạng thái đơn sang ${next}?`)) return;
    setUpdating(true);
    try {
      await axiosClient.patch(`/orders/${id}/status`, null, { params: { status: next }});
      alert("Đã đổi trạng thái");
      load();
    } catch (err) {
      console.error(err);
      alert("Thất bại");
    } finally { setUpdating(false); }
  };

  if (loading) return <div>Đang tải đơn...</div>;
  if (!order) return <div>Không tìm thấy đơn</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Order #{order.id}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Khách hàng</h4>
          <p>{order.user?.username} — {order.user?.email}</p>
          <p>Địa chỉ: {order.address?.address || order.addressString || "Chưa có"}</p>
        </div>

        <div>
          <h4 className="font-medium">Thông tin</h4>
          <p>Tổng: {order.totalPrice?.toLocaleString()} đ</p>
          <p>Trạng thái: <span className="font-semibold">{order.status}</span></p>
          <p>Ngày: {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium">Sản phẩm</h4>
        <ul className="divide-y">
          {(order.items || []).map((it)=>(
            <li key={it.id} className="py-2 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded flex flex-col items-center justify-center text-indigo-700 text-xs">
                <div className="text-lg">📚</div>
                <div className="text-center leading-tight px-1">
                  {it.title?.substring(0, 6) || 'Book'}
                </div>
              </div>
              <div>
                <div className="font-semibold">{it.title || it.bookTitle}</div>
                <div>Qty: {it.qty || it.quantity} — { (it.price || it.unitPrice)?.toLocaleString() } đ</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex gap-2">
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border p-2 rounded">
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPING">SHIPPING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <button onClick={()=>changeStatus(status)} disabled={updating} className="bg-green-600 text-white px-4 py-2 rounded">
          {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
        </button>

        <button onClick={()=>navigate(-1)} className="px-4 py-2 border rounded">Quay lại</button>
      </div>
    </div>
  );
}
