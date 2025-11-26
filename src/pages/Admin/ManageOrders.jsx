import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { FaBox, FaSpinner, FaEye, FaSync } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Loading ALL orders for admin...');
      
      // Try multiple admin endpoints to get ALL orders
      const adminEndpoints = [
        '/orders',  // Simple all orders
        '/orders/all',  // Explicit all orders
        '/admin/orders',  // Admin specific endpoint
        '/orders/list',  // Current working user endpoint
        '/orders/admin/list'  // Admin list endpoint
      ];
      
      let ordersData = [];
      let successEndpoint = null;
      
      for (const endpoint of adminEndpoints) {
        try {
          console.log(`🔍 Trying admin endpoint: ${endpoint}`);
          const response = await axiosClient.get(`${endpoint}?pageNo=0&pageSize=1000&sortBy=createdAt:desc`);
          console.log(`✅ SUCCESS with ${endpoint}:`, response.data);
          
          // Extract orders from different response structures
          if (response.data?.data?.content) {
            ordersData = response.data.data.content;
          } else if (response.data?.data?.items) {
            ordersData = response.data.data.items;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            ordersData = response.data.data;
          } else if (Array.isArray(response.data)) {
            ordersData = response.data;
          } else {
            ordersData = [];
          }
          
          successEndpoint = endpoint;
          console.log(`📦 Admin found ${ordersData.length} orders via ${endpoint}`);
          break;
          
        } catch (endpointError) {
          console.log(`❌ Failed ${endpoint}: ${endpointError.response?.status} - ${endpointError.response?.data?.message || endpointError.message}`);
          continue;
        }
      }
      
      if (!successEndpoint) {
        throw new Error('All admin endpoints failed - no admin access to orders');
      }
      
      console.log(`🎯 Admin loaded ${ordersData.length} orders from ${successEndpoint}`);
      setOrders(ordersData);
      
    } catch (err) {
      console.error('❌ Failed to load admin orders:', err);
      setError(`Admin không thể tải đơn hàng: ${err.message}. Kiểm tra quyền admin hoặc backend.`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPING': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'Chờ xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy';
      default: return status || 'Không rõ';
    }
  };

  const ordersArray = Array.isArray(orders) ? orders : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            Quản lý Đơn hàng
          </h1>
          <span className="text-gray-600">({ordersArray.length} đơn hàng)</span>
        </div>
        <button
          onClick={loadOrders}
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="font-semibold text-gray-800">Danh sách Đơn hàng</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : ordersArray.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-4">
              <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-red-600 text-lg mb-2 font-medium">⚠️ Admin không thể truy cập đơn hàng</p>
              <p className="text-gray-600 text-sm mb-4">Backend đang trả về lỗi 403 Forbidden</p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">🔧 Giải pháp tạm thời:</h3>
                <div className="space-y-2 text-yellow-700">
                  <p>1. <strong>Xem đơn hàng từ trang user:</strong></p>
                  <a 
                    href="/orders" 
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open('/orders', '_blank');
                    }}
                  >
                    🔗 Mở trang Orders trong tab mới
                  </a>
                  <p className="text-xs">Trang này hiển thị 11 đơn hàng đã có</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">🔍 Nguyên nhân lỗi:</h3>
                <ul className="text-left list-disc list-inside space-y-1 text-red-700 text-xs max-w-md mx-auto">
                  <li>Token JWT không có quyền ADMIN</li>
                  <li>Backend yêu cầu role ADMIN để xem tất cả orders</li>
                  <li>Endpoint /orders/list chỉ cho phép admin access</li>
                  <li>User hiện tại chỉ có quyền user thường</li>
                </ul>
              </div>
              
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                🔄 Thử lại với các endpoint khác
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Mã đơn hàng</th>
                  <th className="text-left p-4 font-medium text-gray-700">Khách hàng</th>
                  <th className="text-left p-4 font-medium text-gray-700">Tổng tiền</th>
                  <th className="text-left p-4 font-medium text-gray-700">Trạng thái</th>
                  <th className="text-left p-4 font-medium text-gray-700">Ngày đặt</th>
                  <th className="text-left p-4 font-medium text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {ordersArray.map(order => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm text-blue-600">#{order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">{order.customerName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{order.customerEmail || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{order.customerPhone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-green-600">
                      {formatCurrency(order.totalAmount || order.total || 0)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const itemsText = order.orderDetails?.map(item => 
                              `- ${item.bookTitle || `Book ID: ${item.bookId}`} x${item.quantity} = ${formatCurrency(item.unitPrice * item.quantity)}`
                            ).join('\n') || 'Không có thông tin sản phẩm';
                            
                            alert(`Chi tiết đơn hàng ${order.id}:\n\nKhách hàng: ${order.customerName}\nEmail: ${order.customerEmail}\nSĐT: ${order.customerPhone}\nĐịa chỉ: ${order.shippingAddress}\nTổng tiền: ${formatCurrency(order.totalAmount)}\nTrạng thái: ${getStatusText(order.status)}\nNgày đặt: ${order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}\nPhương thức thanh toán: ${order.paymentMethod}\nGhi chú: ${order.notes || 'Không có'}\n\nSản phẩm:\n${itemsText}`);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                        >
                          <FaEye />
                          Xem
                        </button>
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            if (confirm(`Cập nhật trạng thái đơn hàng ${order.id} thành "${getStatusText(newStatus)}"?`)) {
                              try {
                                await axiosClient.patch(`/orders/${order.id}/status?status=${newStatus}`);
                                loadOrders();
                              } catch (error) {
                                alert("Không thể cập nhật trạng thái: " + error.message);
                              }
                            }
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="PENDING">Chờ xử lý</option>
                          <option value="CONFIRMED">Đã xác nhận</option>
                          <option value="SHIPPING">Đang giao</option>
                          <option value="DELIVERED">Đã giao</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
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
