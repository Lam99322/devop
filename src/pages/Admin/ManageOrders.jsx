import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { FaBox, FaSpinner, FaEye, FaEdit, FaCheck, FaTimes, FaCog } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";
import APITester from "../../components/APITester";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAPITester, setShowAPITester] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📦 Loading orders from backend...");
      
      let res = null;
      // Thử nhiều endpoint có thể có
      const endpoints = ["/orders/list", "/orders", "/admin/orders", "/api/orders", "/orders/all"];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          res = await axiosClient.get(endpoint);
          console.log(`✅ Success with endpoint ${endpoint}:`, res.data);
          break;
        } catch (err) {
          console.log(`❌ Failed endpoint ${endpoint}:`, err.response?.status, err.response?.data);
        }
      }
      
      if (!res) {
        throw new Error("Không thể kết nối với bất kỳ endpoint nào");
      }
      
      // Handle response structure với debug chi tiết
      let ordersData = [];
      console.log("📋 Full response:", JSON.stringify(res.data, null, 2));
      
      if (res.data) {
        if (Array.isArray(res.data)) {
          ordersData = res.data;
          console.log("✅ Response is direct array");
        } else if (res.data.data && Array.isArray(res.data.data)) {
          ordersData = res.data.data;
          console.log("✅ Response is wrapped in .data");
        } else if (res.data.content && Array.isArray(res.data.content)) {
          ordersData = res.data.content;
          console.log("✅ Response is wrapped in .content (paginated)");
        } else if (res.data.orders && Array.isArray(res.data.orders)) {
          ordersData = res.data.orders;
          console.log("✅ Response is wrapped in .orders");
        } else if (res.data.result && Array.isArray(res.data.result)) {
          ordersData = res.data.result;
          console.log("✅ Response is wrapped in .result");
        } else {
          console.warn("❌ Unexpected orders response structure:", res.data);
          console.warn("Available keys:", Object.keys(res.data));
          ordersData = [];
        }
      }
      
      console.log(`📦 Loaded ${ordersData.length} orders:`, ordersData);
      setOrders(ordersData);
      
      if (ordersData.length === 0) {
        setError("Chưa có đơn hàng nào trong hệ thống.");
      }
    } catch (err) {
      console.error("❌ Error loading orders:", err);
      let errorMsg = "Không thể tải danh sách đơn hàng";
      if (err.response?.status === 401) {
        errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (err.response?.status === 403) {
        errorMsg = "Không có quyền truy cập đơn hàng.";
      } else if (err.response?.status === 405) {
        errorMsg = "API endpoint không đúng. Backend có thể chưa hỗ trợ /orders/list.";
      } else {
        errorMsg = `Lỗi kết nối: ${err.response?.status} - ${err.message}`;
      }
      setError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
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
          onClick={() => setShowAPITester(!showAPITester)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          <FaCog />
          {showAPITester ? 'Ẩn' : 'Debug'} API
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
          <button
            onClick={() => {
              console.log("🎭 Loading mock orders for testing...");
              setOrders([
                {
                  id: "ORDER-001",
                  userId: "user-123",
                  customerName: "Nguyễn Văn A",
                  total: 250000,
                  status: "pending",
                  createdAt: new Date().toISOString(),
                  items: [
                    { title: "Đắc Nhân Tâm", quantity: 2, price: 89000 },
                    { title: "Sapiens", quantity: 1, price: 125000 }
                  ]
                },
                {
                  id: "ORDER-002", 
                  userId: "user-456",
                  customerName: "Trần Thị B",
                  total: 180000,
                  status: "delivered",
                  createdAt: new Date(Date.now() - 86400000).toISOString(),
                  items: [
                    { title: "Clean Code", quantity: 1, price: 180000 }
                  ]
                }
              ]);
              setError(null);
            }}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Dùng dữ liệu mẫu để test
          </button>
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
                        <p className="font-medium text-gray-800">{order.customerName || order.user || 'N/A'}</p>
                        <p className="text-sm text-gray-500">ID: {order.userId || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-green-600">
                      {formatCurrency(order.total)}
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
                            const itemsText = order.items?.map(item => 
                              `- ${item.title} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`
                            ).join('\n') || 'Không có thông tin sản phẩm';
                            
                            alert(`Chi tiết đơn hàng ${order.id}:\n\nKhách hàng: ${order.customerName || order.user || 'N/A'}\nTổng tiền: ${formatCurrency(order.total)}\nTrạng thái: ${getStatusText(order.status)}\nNgày đặt: ${order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}\n\nSản phẩm:\n${itemsText}`);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                        >
                          <FaEye />
                          Xem
                        </button>
                        <button
                          onClick={() => alert("Chức năng cập nhật trạng thái sẽ được implement sau")}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                        >
                          <FaEdit />
                          Cập nhật
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

      {/* API Tester */}
      {showAPITester && (
        <div className="border-t pt-6">
          <APITester />
        </div>
      )}
    </div>
  );
}
