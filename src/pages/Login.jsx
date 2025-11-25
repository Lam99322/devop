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
        username: form.username, // hoặc "email" nếu backend yêu cầu
        password: form.password,
      };

      const res = await authAPI.login(payload);
      console.log("🔍 Login response:", res.data);
      
      if (res.data?.data?.accessToken) {
        // Use user info from backend response
        console.log("🔍 Backend login response:", res.data);
        
        let userInfo = res.data.data.user;
        
        // If backend doesn't provide user info, create fallback
        if (!userInfo) {
          console.log("⚠️ No user info from backend, creating fallback");
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
          console.log("✅ Using user info from backend:", userInfo);
          
          // Ensure avatar exists
          if (!userInfo.avatar) {
            userInfo.avatar = `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&name=${encodeURIComponent(userInfo.name || userInfo.username)}`;
          }
        }
        
        // Debug JWT token to see what backend actually sends
        const token = res.data.data.accessToken;
        console.log("🔑 JWT Token received:", token.substring(0, 50) + "...");
        
        // Try to decode JWT token to see user role info
        try {
          const tokenParts = token.split('.');
          const payload = JSON.parse(atob(tokenParts[1] + '='.repeat((4 - tokenParts[1].length % 4) % 4)));
          console.log("🔓 JWT Token payload:", payload);
          
          // Extract role information from different possible JWT fields
          let extractedRole = null;
          let extractedRoles = [];
          
          // Check various JWT fields for role information
          if (payload.role) {
            extractedRole = payload.role;
            console.log("📋 Found role in payload.role:", extractedRole);
          }
          
          if (payload.roles) {
            if (Array.isArray(payload.roles)) {
              extractedRoles = payload.roles;
              if (!extractedRole && payload.roles.length > 0) {
                extractedRole = payload.roles[0]; // Use first role as primary
              }
            } else {
              extractedRole = payload.roles; // Single role as string
              extractedRoles = [payload.roles];
            }
            console.log("📋 Found roles in payload.roles:", extractedRoles);
          }
          
          if (payload.authorities) {
            console.log("📋 Found authorities:", payload.authorities);
            if (Array.isArray(payload.authorities)) {
              extractedRoles = [...extractedRoles, ...payload.authorities];
              if (!extractedRole && payload.authorities.includes('ADMIN')) {
                extractedRole = 'ADMIN';
              }
            }
          }
          
          // Check for Spring Security format (ROLE_ADMIN)
          if (payload.scope && payload.scope.includes('ROLE_ADMIN')) {
            extractedRole = 'ADMIN';
            extractedRoles = ['ADMIN'];
            console.log("📋 Found ADMIN role in JWT scope");
          }
          
          // Update userInfo with extracted role data
          if (extractedRole) {
            userInfo.role = extractedRole;
            console.log("✅ Set user role to:", extractedRole);
          }
          
          if (extractedRoles.length > 0) {
            userInfo.roles = extractedRoles.map(role => typeof role === 'string' ? { name: role } : role);
            console.log("✅ Set user roles to:", userInfo.roles);
          }
          
          // Additional check for admin username fallback
          if (!extractedRole && form.username === 'admin123') {
            console.log("🔧 Fallback: Setting admin role for admin123 user");
            userInfo.role = 'ADMIN';
            userInfo.roles = [{ name: 'ADMIN' }];
          }
          
        } catch (jwtError) {
          console.error("❌ Failed to decode JWT:", jwtError);
          // Fallback role assignment for admin username
          if (form.username === 'admin123') {
            console.log("🔧 JWT decode failed, using username-based admin role");
            userInfo.role = 'ADMIN';
            userInfo.roles = [{ name: 'ADMIN' }];
          }
        }
        
        console.log("🔍 Final user info to save:", userInfo);
        login(userInfo, token);
        
        // Show success message
        const isAdminUser = userInfo.role === 'ADMIN' || userInfo.roles?.some(r => r.name === 'ADMIN');
        console.log(`✅ Login successful! Welcome ${userInfo.name || userInfo.username}${isAdminUser ? ' (Admin)' : ' (User)'}`);
        
        // Redirect to admin if admin, otherwise home
        navigate(isAdminUser ? "/admin" : "/"); // redirect admin to admin panel
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
          placeholder="Tên người dùng (admin123 hoặc user123)"
          value={form.username}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu (admin123 hoặc user123)"
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
