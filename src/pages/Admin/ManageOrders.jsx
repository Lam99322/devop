import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { FaBox, FaSpinner, FaEye, FaEdit, FaCheck, FaTimes, FaSync } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // BaseURL đã có /bookstore, endpoint từ controller: GET /orders/list  
      const res = await axiosClient.get("/orders/list");
      
      // Backend: ApiResponse<PageResponse<Object>>
      const ordersData = res.data?.data?.content || [];
      console.log('📦 Orders received:', ordersData);
      setOrders(ordersData);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
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

  // Ensure orders is array
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
            <p className="text-gray-600">Chưa có đơn hàng nào.</p>
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
                                // Reload orders after update
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
