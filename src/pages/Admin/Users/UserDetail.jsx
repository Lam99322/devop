import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/users/${id}`);
      setUser(res.data.data);
      setForm({
        username: res.data.data.username || "",
        name: res.data.data.name || "",
        email: res.data.data.email || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosClient.put(`/users/${id}`, form);
      setUser(res.data.data);
      alert("Cập nhật thành công");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xoá người dùng này?")) return;
    try {
      await axiosClient.delete(`/users/${id}`);
      alert("Đã xoá");
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
      alert("Xoá thất bại");
    }
  };

  const toggleStatus = async (nextStatus) => {
    try {
      await axiosClient.patch(`/users/${id}/status`, null, { params: { status: nextStatus }});
      alert("Đã đổi trạng thái");
      load();
    } catch (err) {
      console.error(err);
      alert("Đổi trạng thái thất bại");
    }
  };

  if (loading) return <div>Đang tải người dùng...</div>;
  if (!user) return <div>Không tìm thấy người dùng</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">User detail — {user.username}</h2>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-sm">Username</label>
          <input className="w-full border p-2 rounded" value={form.username}
                 onChange={(e)=>setForm({...form, username: e.target.value})}/>
        </div>

        <div>
          <label className="block text-sm">Họ tên</label>
          <input className="w-full border p-2 rounded" value={form.name}
                 onChange={(e)=>setForm({...form, name: e.target.value})}/>
        </div>

        <div>
          <label className="block text-sm">Email</label>
          <input className="w-full border p-2 rounded" value={form.email}
                 onChange={(e)=>setForm({...form, email: e.target.value})}/>
        </div>

        <div className="flex gap-2">
          <button disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded">
            {saving ? "Đang lưu..." : "Lưu"}
          </button>

          <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
            Xoá
          </button>

          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
            Quay lại
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-medium">Trạng thái</h3>
        <p className="mb-2">Hiện tại: <span className="font-semibold">{user.status}</span></p>
        <div className="flex gap-2">
          <button onClick={() => toggleStatus("ACTIVE")} className="px-3 py-1 bg-blue-500 text-white rounded">Set ACTIVE</button>
          <button onClick={() => toggleStatus("INACTIVE")} className="px-3 py-1 bg-yellow-500 text-white rounded">Set INACTIVE</button>
        </div>
      </div>
    </div>
  );
}
