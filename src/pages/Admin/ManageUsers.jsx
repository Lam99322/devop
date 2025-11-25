import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { FaUsers, FaSpinner, FaEye, FaEdit, FaTrash, FaBan, FaCheck } from "react-icons/fa";
import API_ENDPOINTS from "../../constants/apiEndpoints";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading users from backend...');
      
      // Use exact backend endpoint: GET /users (ADMIN: Get all users)
      const res = await axiosClient.get(API_ENDPOINTS.USERS.GET_ALL);
      console.log('✅ Users loaded successfully:', res.data);
      
      // Handle ApiResponse structure
      let usersData = [];
      if (res.data?.data?.content && Array.isArray(res.data.data.content)) {
        usersData = res.data.data.content;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        usersData = res.data;
      }
      
      setUsers(usersData);
      console.log(`👥 Loaded ${usersData.length} users`);
      
    } catch (err) {
      console.error('❌ Failed to load users:', err);
      setError(`Không thể tải danh sách người dùng: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      console.log(`🔄 Updating user ${userId} status to ${status}...`);
      
      // Use exact backend endpoint: PATCH /users/{userId}/status
      await axiosClient.patch(API_ENDPOINTS.USERS.UPDATE_STATUS(userId), null, {
        params: { status }
      });
      
      console.log('✅ User status updated successfully');
      alert('Cập nhật trạng thái người dùng thành công!');
      loadUsers(); // Reload users
      
    } catch (error) {
      console.error('❌ Failed to update user status:', error);
      alert(`Không thể cập nhật trạng thái: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    
    try {
      console.log(`🗑️ Deleting user ${userId}...`);
      
      // Use exact backend endpoint: DELETE /users/{userId}
      await axiosClient.delete(API_ENDPOINTS.USERS.DELETE(userId));
      
      console.log('✅ User deleted successfully');
      alert('Xóa người dùng thành công!');
      loadUsers(); // Reload users
      
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      alert(`Không thể xóa người dùng: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getUserStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'BANNED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserRoleColor = (roles) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800';
    
    const roleNames = roles.map(r => r.name || r).join(', ');
    if (roleNames.includes('ADMIN')) return 'bg-purple-100 text-purple-800';
    if (roleNames.includes('MANAGER')) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-blue-600" />
            Quản lý Người dùng
          </h1>
          <span className="text-gray-600">({users.length} người dùng)</span>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <FaSpinner className={loading ? 'animate-spin' : ''} />
          Tải lại
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="font-semibold text-gray-800">Danh sách Người dùng</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có người dùng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">ID</th>
                  <th className="text-left p-4 font-medium text-gray-700">Tên đăng nhập</th>
                  <th className="text-left p-4 font-medium text-gray-700">Email</th>
                  <th className="text-left p-4 font-medium text-gray-700">Họ tên</th>
                  <th className="text-left p-4 font-medium text-gray-700">Vai trò</th>
                  <th className="text-left p-4 font-medium text-gray-700">Trạng thái</th>
                  <th className="text-left p-4 font-medium text-gray-700">Ngày tạo</th>
                  <th className="text-left p-4 font-medium text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">{user.id}</td>
                    <td className="p-4 font-medium">{user.username}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.fullName || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserRoleColor(user.roles)}`}>
                        {user.roles?.map(r => r.name || r).join(', ') || 'USER'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}>
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const userInfo = `Thông tin người dùng:\n\nID: ${user.id}\nTên đăng nhập: ${user.username}\nEmail: ${user.email}\nHọ tên: ${user.fullName || 'N/A'}\nVai trò: ${user.roles?.map(r => r.name || r).join(', ') || 'USER'}\nTrạng thái: ${user.status || 'ACTIVE'}\nNgày tạo: ${user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : 'N/A'}`;
                            alert(userInfo);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                          <FaEye />
                        </button>
                        
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => updateUserStatus(user.id, 'INACTIVE')}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                          >
                            <FaBan />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                          >
                            <FaCheck />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}