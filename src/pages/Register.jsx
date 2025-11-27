import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { axiosClientPublic } from "../api/axiosClient";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosClientPublic.post("/users/add", form);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-pink-50 to-yellow-50 p-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-3xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Illustration */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-500 to-green-700 p-12 flex-col justify-center items-center text-white">
            <h2 className="text-4xl font-extrabold mb-4">Chào mừng bạn!</h2>
            <p className="text-lg mb-6 text-white/90">Tạo tài khoản để bắt đầu trải nghiệm</p>
            <img
              src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
              alt="register illustration"
              className="w-40 h-40 animate-bounce"
            />
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/2 p-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Đăng ký</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="name"
                placeholder="Họ và tên"
                value={form.name}
                onChange={handleChange}
                className="w-full px-6 py-4 border rounded-3xl focus:ring-2 focus:ring-green-400 outline-none shadow-md hover:shadow-lg text-lg"
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Tên đăng nhập"
                value={form.username}
                onChange={handleChange}
                className="w-full px-6 py-4 border rounded-3xl focus:ring-2 focus:ring-green-400 outline-none shadow-md hover:shadow-lg text-lg"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-6 py-4 border rounded-3xl focus:ring-2 focus:ring-green-400 outline-none shadow-md hover:shadow-lg text-lg"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                className="w-full px-6 py-4 border rounded-3xl focus:ring-2 focus:ring-green-400 outline-none shadow-md hover:shadow-lg text-lg"
                required
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-3xl font-semibold hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-70 text-lg"
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </form>

            <p className="text-center text-md text-gray-500 mt-8">
              Bạn đã có tài khoản?{" "}
              <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
