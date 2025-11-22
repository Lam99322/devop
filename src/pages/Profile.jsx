import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { userAPI } from "../api/apiHelpers";

export default function Profile() {
  const { user: contextUser, token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      console.log("🔍 Fetching profile with token:", token ? "exists" : "missing");
      
      try {
        const res = await userAPI.getMyInfo();
        console.log("✅ Profile response:", res.data);
        setProfile(res.data.data); // data nằm trong ApiResponse { message, data }
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err.response?.data || err);
        console.error("❌ Error status:", err.response?.status);
        console.error("❌ Error headers:", err.response?.headers);
        
        // Chỉ logout nếu là lỗi 401 (Unauthorized), không logout với 400
        if (err.response?.status === 401) {
          console.log("🔄 Token expired, logging out...");
          logout();
        } else {
          // Với lỗi 400, có thể dùng thông tin user từ context
          console.log("📋 Using context user instead:", contextUser);
          setProfile(contextUser);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, logout, contextUser]);

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded mb-4 w-1/4"></div>
        <div className="h-32 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
  
  if (!profile && !contextUser) return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <p className="text-gray-600">Bạn chưa đăng nhập</p>
        <a href="/login" className="text-blue-600 hover:underline">Đăng nhập ngay</a>
      </div>
    </div>
  );
  
  // Sử dụng profile từ API hoặc fallback về contextUser
  const displayUser = profile || contextUser;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-4">Thông tin tài khoản</h2>

      <div className="flex items-center gap-4">
        {displayUser?.avatar && (
          <img
            src={displayUser.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border"
          />
        )}
        <div className="space-y-1">
          <p><strong>ID:</strong> {displayUser?.id || 'N/A'}</p>
          <p><strong>Username:</strong> {displayUser?.username || 'N/A'}</p>
          <p><strong>Họ tên:</strong> {displayUser?.name || displayUser?.fullName || 'N/A'}</p>
          <p><strong>Email:</strong> {displayUser?.email || 'N/A'}</p>
          <p><strong>Trạng thái:</strong> {displayUser?.status || 'N/A'}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mt-2">Roles & Permissions</h3>
        {displayUser?.roles && displayUser.roles.length > 0 ? (
          <ul className="list-disc ml-5 space-y-1">
            {displayUser.roles.map((role, idx) => (
              <li key={idx}>
                <strong>{role.name || role}</strong> {role.description && `- ${role.description}`}
                {role.permissions && role.permissions.length > 0 && (
                  <ul className="list-circle ml-5 mt-1">
                    {role.permissions.map((perm, pidx) => (
                      <li key={pidx}>
                        {perm.name || perm} {perm.description && `- ${perm.description}`}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có role nào</p>
        )}
      </div>
    </div>
  );
}
