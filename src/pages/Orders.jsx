import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { getBookImageUrl, handleImageError } from "../utils/imageUtils";
import { 
  FaBox, 
  FaShippingFast, 
  FaCheckCircle, 
  FaTimes, 
  FaClock, 
  FaEye,
  FaArrowLeft,
  FaReceipt,
  FaExclamationTriangle
} from "react-icons/fa";

export default function Orders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock orders for demo when backend fails
  const mockOrders = [
    {
      id: "ORDER-1732112403000",
      createdAt: "2024-11-20T10:30:00Z",
      status: "DELIVERED",
      total: 275000,
      items: [
        { id: 1, title: "Clean Code", quantity: 1, price: 250000 },
      ],
      shippingAddress: "123 Nguyễn Văn A, Quận 1, TP.HCM",
      paymentMethod: "cod"
    },
    {
      id: "ORDER-1732105200000", 
      createdAt: "2024-11-19T15:20:00Z",
      status: "SHIPPING",
      total: 520000,
      items: [
        { id: 2, title: "Design Patterns", quantity: 2, price: 200000 },
        { id: 3, title: "Refactoring", quantity: 1, price: 120000 }
      ],
      shippingAddress: "456 Lê Văn B, Quận 3, TP.HCM",
      paymentMethod: "bank_transfer"
    },
    {
      id: "ORDER-1731998000000",
      createdAt: "2024-11-18T09:45:00Z", 
      status: "PENDING",
      total: 180000,
      items: [
        { id: 4, title: "JavaScript: The Good Parts", quantity: 1, price: 155000 }
      ],
      shippingAddress: "789 Trần Văn C, Quận 5, TP.HCM",
      paymentMethod: "cod"
    }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user?.id) {
          navigate("/login");
          return;
        }
        
        console.log(`🔍 Fetching orders for user: ${user.id}`);
        const res = await axiosClient.get(`/orders/list/user/${user.id}`);
        
        console.log("✅ Orders response:", res.data);
        console.log("🔍 Response data type:", typeof res.data?.data);
        console.log("🔍 Response data keys:", res.data?.data ? Object.keys(res.data.data) : 'no data');
        
        // Handle different response structures
        let ordersData = [];
        if (res.data?.data) {
          if (Array.isArray(res.data.data)) {
            console.log("📋 Using res.data.data as array");
            ordersData = res.data.data;
          } else if (res.data.data.items && Array.isArray(res.data.data.items)) {
            console.log("📋 Using res.data.data.items (pagination)");
            ordersData = res.data.data.items;
          } else if (res.data.data.content && Array.isArray(res.data.data.content)) {
            console.log("📋 Using res.data.data.content");
            ordersData = res.data.data.content;
          } else if (res.data.data.orders && Array.isArray(res.data.data.orders)) {
            console.log("📋 Using res.data.data.orders");
            ordersData = res.data.data.orders;
          } else {
            console.warn("⚠️ Unexpected response structure:", res.data.data);
            console.warn("Available keys:", Object.keys(res.data.data || {}));
            ordersData = [];
          }
        }
        
        console.log("📦 Processed orders data:", ordersData);
        console.log("📄 Pagination info:", {
          pageNo: res.data.data?.pageNo,
          pageSize: res.data.data?.pageSize,
          totalPages: res.data.data?.totalPages,
          totalElements: res.data.data?.totalElements
        });
        
        // If no orders from backend, check localStorage for mock orders
        if (ordersData.length === 0) {
          try {
            const mockOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
            if (mockOrders.length > 0) {
              console.log("📦 Using mock orders from localStorage:", mockOrders);
              ordersData = mockOrders;
            }
          } catch (storageError) {
            console.error("❌ Failed to load mock orders:", storageError);
          }
        }
        
        setOrders(ordersData);
        
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
        console.warn("🎭 Using mock orders for demo");
        
        setError(`API Error: ${err.response?.status || 'Unknown'} - Using demo data`);
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, navigate]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'confirmed': return <FaCheckCircle className="text-blue-500" />;
      case 'shipping': return <FaShippingFast className="text-purple-500" />;
      case 'delivered': return <FaBox className="text-green-500" />;
      case 'cancelled': return <FaTimes className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status || 'Không rõ';
    }
  };

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

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'credit_card': return 'Thẻ tín dụng';
      default: return method || 'Không rõ';
    }
  };

  // Ensure orders is always an array before filtering
  const ordersArray = Array.isArray(orders) ? orders : [];
  
  const filteredOrders = ordersArray.filter(order => {
    if (selectedStatus === 'all') return true;
    return order.status?.toLowerCase() === selectedStatus.toLowerCase();
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải đơn hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Về trang chủ
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Đơn hàng của bạn</h1>
        <p className="text-gray-600">Theo dõi trạng thái và lịch sử đơn hàng</p>
        
        {error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-500 mr-2" />
              <span className="text-yellow-800 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "all" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tất cả ({ordersArray.length})
          </button>
          
          {['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map(status => {
            const count = ordersArray.filter(o => o.status?.toLowerCase() === status).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {getStatusText(status)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <FaReceipt className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {selectedStatus === "all" ? "Chưa có đơn hàng nào" : `Không có đơn hàng ${getStatusText(selectedStatus).toLowerCase()}`}
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedStatus === "all" 
              ? "Backend đã trả về thành công nhưng danh sách đơn hàng trống. Hãy thử đặt hàng từ trang sản phẩm!"
              : "Chọn bộ lọc khác để xem các đơn hàng."
            }
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaBox className="mr-2" />
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Đơn hàng #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Đặt ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </div>
                    
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <FaEye />
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium text-gray-800 mb-3">Sản phẩm đã đặt:</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={getBookImageUrl(item)}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded"
                            data-book-id={item.id || item.bookId}
                            onError={(e) => handleImageError(e, item.title)}
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">{item.title}</h5>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>SL: {item.quantity}</span>
                              <span>Giá: {formatCurrency(item.price)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-blue-600">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">Thông tin đơn hàng</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-semibold text-blue-600">{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thanh toán:</span>
                          <span>{getPaymentMethodText(order.paymentMethod)}</span>
                        </div>
                      </div>
                    </div>

                    {(order.shippingAddress || order.customerInfo?.address) && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Địa chỉ giao hàng</h5>
                        <p className="text-sm text-gray-600">{order.shippingAddress || order.customerInfo?.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back to Shopping */}
      {filteredOrders.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <FaBox className="mr-2" />
            Tiếp tục mua sắm
          </Link>
        </div>
      )}
    </div>
  );
}
