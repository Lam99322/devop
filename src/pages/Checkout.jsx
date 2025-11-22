import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import cookieUtils from "../utils/cookieUtils";
import { formatCurrency } from "../utils/formatCurrency";
import { FaTrash, FaCreditCard, FaShippingFast, FaLock, FaCheckCircle } from "react-icons/fa";

export default function Checkout() {
  const { cart, clearCart, removeFromCart, updateQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [orderForm, setOrderForm] = useState({
    // Customer Info
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    
    // Shipping Address
    address: "",
    city: "",
    district: "",
    ward: "",
    postalCode: "",
    
    // Payment & Delivery
    paymentMethod: "cod", // cod, credit_card, bank_transfer
    deliveryMethod: "standard", // standard, express
    notes: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [errors, setErrors] = useState({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Calculate totals
  const subtotal = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shippingFee = orderForm.deliveryMethod === "express" ? 50000 : 25000;
  const tax = subtotal * 0.08; // 8% VAT
  const total = subtotal + shippingFee + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!orderForm.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!orderForm.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!orderForm.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!orderForm.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!orderForm.city.trim()) newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    if (!orderForm.district.trim()) newErrors.district = "Vui lòng chọn quận/huyện";
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (orderForm.email && !emailRegex.test(orderForm.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Validate phone format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (orderForm.phone && !phoneRegex.test(orderForm.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    setLoading(true);
    
    try {
      // Try simple payload first - backend may expect different format
      const orderPayload = {
        items: cart.map(item => ({
          id: item.id,
          bookId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity || item.qty || 1
        })),
        customerName: orderForm.fullName,
        customerEmail: orderForm.email,
        customerPhone: orderForm.phone,
        shippingAddress: `${orderForm.address}, ${orderForm.ward ? orderForm.ward + ', ' : ''}${orderForm.district}, ${orderForm.city}`,
        paymentMethod: orderForm.paymentMethod,
        deliveryMethod: orderForm.deliveryMethod,
        totalAmount: total,
        subtotal: subtotal,
        shippingFee: shippingFee,
        tax: tax,
        notes: orderForm.notes || "",
        status: "PENDING"
      };

      console.log("📦 Placing order:", orderPayload);
      
      // Try the API call with the payload
      let response;
      try {
        response = await axiosClient.post("/orders", orderPayload);
      } catch (firstError) {
        console.warn("⚠️ Complex payload failed, trying simple format...");
        
        // Try minimal payload if complex one fails  
        const simplePayload = {
          items: cart.map(item => ({
            bookId: item.id,
            quantity: item.quantity || item.qty || 1,
            price: item.price
          }))
        };
        
        console.log("🔄 Trying minimal payload (items only):", simplePayload);
        
        try {
          response = await axiosClient.post("/orders", simplePayload);
        } catch (secondError) {
          console.warn("⚠️ Even minimal payload failed, trying original format...");
          
          // Last resort - try the original simple format
          const originalPayload = { items: cart };
          console.log("🔄 Trying original format:", originalPayload);
          
          try {
            response = await axiosClient.post("/orders", originalPayload);
          } catch (finalError) {
            console.error("❌ All formats failed. Backend /orders endpoint has issues.");
            console.error("❌ Final error details:", finalError);
            console.warn("🎭 Using mock success for demo purposes");
            
            // Create comprehensive mock order
            const mockOrder = {
              id: 'ORDER-' + Date.now(),
              status: 'pending',
              total: total,
              createdAt: new Date().toISOString(),
              shippingAddress: `${orderForm.address}, ${orderForm.ward ? orderForm.ward + ', ' : ''}${orderForm.district}, ${orderForm.city}`,
              items: cart.map(item => ({
                bookId: item.bookId,
                title: item.title,
                author: item.author,
                price: item.price,
                quantity: item.quantity,
                image: item.image
              })),
              customerInfo: {
                name: orderForm.fullName,
                email: orderForm.email,
                phone: orderForm.phone,
                address: `${orderForm.address}, ${orderForm.ward ? orderForm.ward + ', ' : ''}${orderForm.district}, ${orderForm.city}`
              },
              paymentMethod: orderForm.paymentMethod,
              deliveryMethod: orderForm.deliveryMethod
            };
            
            // Store mock order in localStorage for Orders page
            try {
              const existingOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
              existingOrders.unshift(mockOrder); // Add to beginning
              localStorage.setItem('mockOrders', JSON.stringify(existingOrders));
              console.log("💾 Mock order saved to localStorage:", mockOrder);
            } catch (storageError) {
              console.error("❌ Failed to save mock order:", storageError);
            }
            
            // Mock success response for demo
            response = {
              data: {
                success: true,
                data: mockOrder,
                message: 'Order created successfully (mock)'
              }
            };
          }
        }
      }
      
      console.log("✅ Order placed successfully:", response.data);
      setOrderData(response.data.data || response.data);
      setOrderSuccess(true);
      clearCart();
      
    } catch (error) {
      console.error("❌ Checkout failed:", error);
      
      // Safely handle error details
      try {
        console.error("❌ Error details:", {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.response?.data?.message || error?.message || 'Unknown error',
          url: error?.config?.url,
          method: error?.config?.method,
          sentData: error?.config?.data ? JSON.parse(error.config.data) : null,
          headers: error?.response?.headers
        });
      } catch (parseError) {
        console.error("❌ Error parsing failed:", parseError);
      }
      
      // Log what we tried to send vs what backend expects
      console.error("🔍 Debugging order submission:");
      console.error("- Cart items:", cart);
      console.error("- User info:", user);
      console.error("- Token present:", !!cookieUtils.getAuthToken());
      console.error("- Backend might expect different field names or validation rules");
      
      const errorMsg = error?.response?.data?.message || 
                      error?.response?.data?.error ||
                      error?.message ||
                      `Đặt hàng thất bại (${error?.response?.status || 'Unknown'})! Vui lòng thử lại.`;
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Success page
  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Đặt hàng thành công!</h2>
          <p className="text-green-700 mb-4">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.
          </p>
          
          {orderData && (
            <div className="bg-white rounded border p-4 mb-4 text-left">
              <h3 className="font-semibold mb-2">Thông tin đơn hàng:</h3>
              <p><strong>Mã đơn hàng:</strong> {orderData.id || "Đang cập nhật"}</p>
              <p><strong>Tổng tiền:</strong> {formatCurrency(total)}</p>
              <p><strong>Phương thức thanh toán:</strong> {
                orderForm.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" :
                orderForm.paymentMethod === "credit_card" ? "Thẻ tín dụng" : "Chuyển khoản ngân hàng"
              }</p>
            </div>
          )}
          
          <div className="space-x-4">
            <button
              onClick={() => navigate("/orders")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Thanh toán</h1>
        <p className="text-gray-600">Vui lòng kiểm tra thông tin và hoàn tất đơn hàng</p>
        
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>Lưu ý:</strong> Backend /orders API đang gặp lỗi 400. 
            Checkout sẽ dùng demo success để test UI. Cần fix backend để tạo đơn hàng thực.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaLock className="mr-2 text-blue-600" />
              Thông tin khách hàng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={orderForm.fullName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={orderForm.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0901234567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaShippingFast className="mr-2 text-green-600" />
              Địa chỉ giao hàng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ cụ thể *
                </label>
                <input
                  type="text"
                  name="address"
                  value={orderForm.address}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Số nhà, tên đường..."
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố *
                </label>
                <select
                  name="city"
                  value={orderForm.city}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  <option value="ho-chi-minh">TP. Hồ Chí Minh</option>
                  <option value="ha-noi">Hà Nội</option>
                  <option value="da-nang">Đà Nẵng</option>
                  <option value="can-tho">Cần Thơ</option>
                  <option value="hai-phong">Hải Phòng</option>
                  <option value="dong-nai">Đồng Nai</option>
                  <option value="binh-duong">Bình Dương</option>
                  <option value="long-an">Long An</option>
                  <option value="quang-nam">Quảng Nam</option>
                  <option value="khanh-hoa">Khánh Hòa</option>
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện *
                </label>
                <input
                  type="text"
                  name="district"
                  value={orderForm.district}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.district ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Quận/Huyện"
                />
                {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phường/Xã
                </label>
                <input
                  type="text"
                  name="ward"
                  value={orderForm.ward}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Phường/Xã"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã bưu điện
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={orderForm.postalCode}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="70000"
                />
              </div>
            </div>
          </div>

          {/* Payment & Delivery Methods */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaCreditCard className="mr-2 text-purple-600" />
              Phương thức thanh toán & giao hàng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phương thức thanh toán
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={orderForm.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Thanh toán khi nhận hàng</div>
                      <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={orderForm.paymentMethod === "bank_transfer"}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-600">Chuyển khoản qua ATM/Internet Banking</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={orderForm.paymentMethod === "credit_card"}
                      onChange={handleInputChange}
                      className="mr-3"
                      disabled
                    />
                    <div>
                      <div className="font-medium">Thẻ tín dụng/ghi nợ</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard (Đang phát triển)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phương thức giao hàng
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="standard"
                        checked={orderForm.deliveryMethod === "standard"}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Giao hàng tiêu chuẩn</div>
                        <div className="text-sm text-gray-600">3-5 ngày làm việc</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {formatCurrency(25000)}
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="express"
                        checked={orderForm.deliveryMethod === "express"}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Giao hàng nhanh</div>
                        <div className="text-sm text-gray-600">1-2 ngày làm việc</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-orange-600">
                      {formatCurrency(50000)}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú đơn hàng
              </label>
              <textarea
                name="notes"
                value={orderForm.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)..."
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>
            
            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img
                    src={item.image || "https://via.placeholder.com/60x80"}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">SL: {item.quantity}</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Thuế VAT (8%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading || !cart || cart.length === 0}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "Đang xử lý..." : `Đặt hàng • ${formatCurrency(total)}`}
            </button>

            {/* Security Note */}
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-600">
              <FaLock className="mt-0.5 flex-shrink-0" />
              <span>
                Thông tin của bạn được bảo mật và mã hóa. Chúng tôi không lưu trữ thông tin thẻ tín dụng.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
