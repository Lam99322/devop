import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { axiosClientPublic } from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        username: form.username, // hoặc "email" nếu backend yêu cầu
        password: form.password,
      };

      const res = await axiosClientPublic.post("/auth/login", payload);
      if (res.data?.data?.accessToken) {
        // Use AuthContext login method instead of directly setting localStorage
        login(res.data.data.user || { username: form.username }, res.data.data.accessToken);
        navigate("/"); // về trang chủ
      } else {
        setError("Đăng nhập thất bại: không nhận được token");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setError(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="text"
          name="username"
          placeholder="Tên người dùng"
          value={form.username}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        <p className="mt-3 text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-green-600">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
}
