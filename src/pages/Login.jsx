import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/apiHelpers";
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
        username: form.username,
        password: form.password,
      };

      const res = await authAPI.login(payload);
      
      if (res.data?.data?.accessToken) {
        
        let userInfo = res.data.data.user;
        
        if (!userInfo) {
          const isAdmin = form.username === 'admin123';
          userInfo = {
            id: isAdmin ? 'd11f3cf0-4173-4751-9daa-ccde558c5303' : 'user-' + Date.now(),
            username: form.username,
            name: isAdmin ? 'Admin User' : 'Regular User',
            email: isAdmin ? 'admin@bookstore.com' : `${form.username}@example.com`,
            avatar: `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&name=${form.username}`,
            status: 'ACTIVE',
            role: isAdmin ? 'ADMIN' : 'USER',
            roles: isAdmin ? [{ name: 'ADMIN' }] : [{ name: 'USER' }]
          };
        } else {
          // Ensure avatar exists
          if (!userInfo.avatar) {
            userInfo.avatar = `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&name=${encodeURIComponent(userInfo.name || userInfo.username)}`;
          }
        }
        
        const token = res.data.data.accessToken;
        try {
          const tokenParts = token.split('.');
          const payload = JSON.parse(atob(tokenParts[1] + '='.repeat((4 - tokenParts[1].length % 4) % 4)));
          
          let extractedRole = null;
          let extractedRoles = [];
          
          if (payload.role) {
            extractedRole = payload.role;
          }
          
          if (payload.roles) {
            if (Array.isArray(payload.roles)) {
              extractedRoles = payload.roles;
              if (!extractedRole && payload.roles.length > 0) {
                extractedRole = payload.roles[0]; // Use first role as primary
              }
            } else {
              extractedRole = payload.roles;
              extractedRoles = [payload.roles];
            }
          }
          
          if (payload.authorities) {
            if (Array.isArray(payload.authorities)) {
              extractedRoles = [...extractedRoles, ...payload.authorities];
              if (!extractedRole && payload.authorities.includes('ADMIN')) {
                extractedRole = 'ADMIN';
              }
            }
          }
          
          if (payload.scope && payload.scope.includes('ROLE_ADMIN')) {
            extractedRole = 'ADMIN';
            extractedRoles = ['ADMIN'];
          }
          
          if (extractedRole) {
            userInfo.role = extractedRole;
          }
          
          if (extractedRoles.length > 0) {
            userInfo.roles = extractedRoles.map(role => typeof role === 'string' ? { name: role } : role);
          }
          
          if (!extractedRole && form.username === 'admin123') {
            userInfo.role = 'ADMIN';
            userInfo.roles = [{ name: 'ADMIN' }];
          }
          
        } catch (jwtError) {
          if (form.username === 'admin123') {
            userInfo.role = 'ADMIN';
            userInfo.roles = [{ name: 'ADMIN' }];
          }
        }
        
        login(userInfo, token);
        
        const isAdminUser = userInfo.role === 'ADMIN' || userInfo.roles?.some(r => r.name === 'ADMIN');
        navigate(isAdminUser ? "/admin" : "/");
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
