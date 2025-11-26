import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import DiscountForm from './DiscountForm';
import { FaPercent, FaEdit, FaTrash, FaSpinner, FaSync } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function DiscountsList() {
  const [discounts, setDiscounts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try multiple admin endpoints for discounts
      const adminEndpoints = [
        '/discounts',              // Main ADMIN endpoint
        '/admin/discounts',        // Admin specific
        '/discounts/admin',        // Admin namespace
        '/discounts/all'           // All discounts
      ];
      
      let discountsData = [];
      let successEndpoint = null;
      
      for (const endpoint of adminEndpoints) {
        try {
          const response = await axiosClient.get(`${endpoint}?pageNo=0&pageSize=1000&sortBy=createdAt:desc`);
          
          // Extract discounts from different response structures
          if (response.data?.data?.content) {
            discountsData = response.data.data.content;
          } else if (response.data?.data?.items) {
            discountsData = response.data.data.items;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            discountsData = response.data.data;
          } else if (Array.isArray(response.data)) {
            discountsData = response.data;
          }
          
          successEndpoint = endpoint;
          break;
          
        } catch (endpointError) {
          continue;
        }
      }
      
      if (!successEndpoint) {
        throw new Error("Không thể tải dữ liệu từ server");
      }
      
      setDiscounts(discountsData);
      
    } catch (err) {
      setError(`Không thể tải mã giảm giá: ${err.message}`);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const del = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    
    try {
      // Backend uses DELETE /discounts/{discountId}
      await axiosClient.delete(`/discounts/${id}`);
      
      alert('Xóa mã giảm giá thành công!');
      load();
    } catch (err) {
      alert(`Không thể xóa mã giảm giá: ${err.response?.data?.message || err.message}`);
    }
  };

  const getStatusColor = (status, isActive) => {
    if (!isActive || status === 'INACTIVE') return 'bg-red-100 text-red-800';
    if (status === 'ACTIVE') return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaPercent className="text-green-600" />
            Quản lý Mã giảm giá
          </h1>
          <span className="text-gray-600">({discounts.length} mã giảm giá)</span>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
          Tải lại
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {editing ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
          </h2>
          {editing && (
            <button
              onClick={() => setEditing(null)}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Hủy chỉnh sửa
            </button>
          )}
        </div>
        <DiscountForm 
          discount={editing} 
          onSaved={() => { setEditing(null); load(); }} 
        />
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="font-semibold text-gray-800">Danh sách Mã giảm giá</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : discounts.length === 0 ? (
          <div className="p-8 text-center">
            <FaPercent className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có mã giảm giá nào trong hệ thống.</p>
            <button
              onClick={load}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔄 Tải lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Mã</th>
                  <th className="text-left p-4 font-medium text-gray-700">Tên</th>
                  <th className="text-left p-4 font-medium text-gray-700">Phần trăm</th>
                  <th className="text-left p-4 font-medium text-gray-700">Ngày bắt đầu</th>
                  <th className="text-left p-4 font-medium text-gray-700">Ngày kết thúc</th>
                  <th className="text-left p-4 font-medium text-gray-700">Trạng thái</th>
                  <th className="text-left p-4 font-medium text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id || d._id || d.code} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm font-bold text-blue-600">{d.code}</td>
                    <td className="p-4 max-w-xs">
                      <p className="truncate" title={d.name || d.description}>{d.name || d.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-green-600 font-medium">{d.percent}%</span>
                    </td>
                    <td className="p-4 text-sm">
                      {d.startDate ? new Date(d.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="p-4 text-sm">
                      {d.endDate ? new Date(d.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status, d.isActive)}`}>
                        {d.isActive === false ? 'Không hoạt động' : 
                         d.status === 'ACTIVE' ? 'Hoạt động' : 
                         d.status || 'Hoạt động'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            console.log("Discount object for editing:", d);
                            console.log("Available keys:", Object.keys(d));
                            
                            // Check for various ID field names
                            const discountId = d.id || d._id || d.discountId || d.code;
                            
                            if (!discountId) {
                              alert("Không thể chỉnh sửa: Thiếu ID của mã giảm giá");
                              console.error("No valid ID found in discount object:", d);
                              return;
                            }
                            
                            // Ensure the discount object has an id for the form
                            const discountWithId = {
                              ...d,
                              id: discountId
                            };
                            
                            setEditing(discountWithId);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                        >
                          <FaEdit />
                          Sửa
                        </button>
                        <button
                          onClick={() => del(d.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                        >
                          <FaTrash />
                          Xóa
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
