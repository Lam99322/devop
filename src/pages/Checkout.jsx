import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { submitOrder } from "../utils/orderUtils";
import { getBookImageUrl, handleImageError } from "../utils/imageUtils";
import { FaTrash, FaCreditCard, FaShippingFast, FaLock, FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function Checkout() {
  const { cart, clearCart, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [orderForm, setOrderForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    district: "",
    city: "",
    paymentMethod: "cod",
    deliveryMethod: "standard",
    notes: ""
  });

  // Calculate totals
  const subtotal = cart?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shippingFee + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!orderForm.fullName.trim()) newErrors.fullName = "Họ tên là bắt buộc";
    if (!orderForm.email.trim()) newErrors.email = "Email là bắt buộc";
    if (!orderForm.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!orderForm.address.trim()) newErrors.address = "Địa chỉ là bắt buộc";
    if (!orderForm.district.trim()) newErrors.district = "Quận/Huyện là bắt buộc";
    if (!orderForm.city.trim()) newErrors.city = "Tỉnh/Thành phố là bắt buộc";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    if (!cart || cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    setLoading(true);
    try {
      const result = await submitOrder(cart, orderForm, { total, subtotal, shippingFee, tax }, user);
      console.log("✅ Order submitted successfully:", result);
      
      setOrderData(result.data || result);
      setOrderSuccess(true);
      clearCart();
      
    } catch (error) {
      console.error("❌ Order submission failed:", error);
      alert(error.message || "Đặt hàng thất bại! Vui lòng thử lại.");
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
              <h3 className="font-bold mb-2">Thông tin đơn hàng:</h3>
              <p><strong>Mã đơn:</strong> {orderData.id}</p>
              <p><strong>Tổng tiền:</strong> {formatCurrency(orderData.total || total)}</p>
              <p><strong>Trạng thái:</strong> {orderData.status}</p>
              {orderData.message && <p className="text-blue-600 mt-2">{orderData.message}</p>}
            </div>
          )}
          
          <div className="space-x-4">
            <button
              onClick={() => navigate("/orders")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate("/books")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <button
          onClick={() => navigate("/books")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Customer Info & Shipping */}
        <div className="space-y-6">
          
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaLock className="text-blue-600" />
              Thông tin khách hàng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={orderForm.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={orderForm.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nhập email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaShippingFast className="text-green-600" />
              Địa chỉ giao hàng
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ cụ thể *</label>
                <input
                  type="text"
                  name="address"
                  value={orderForm.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Số nhà, tên đường"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quận/Huyện *</label>
                  <input
                    type="text"
                    name="district"
                    value={orderForm.district}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Quận/Huyện"
                  />
                  {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    name="city"
                    value={orderForm.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tỉnh/Thành phố"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Delivery Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaCreditCard className="text-purple-600" />
              Phương thức thanh toán & giao hàng
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phương thức thanh toán</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={orderForm.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Thanh toán khi nhận hàng (COD)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={orderForm.paymentMethod === "bank"}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Chuyển khoản ngân hàng
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phương thức giao hàng</label>
                <select
                  name="deliveryMethod"
                  value={orderForm.deliveryMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="standard">Giao hàng tiêu chuẩn (2-3 ngày)</option>
                  <option value="express">Giao hàng nhanh (1-2 ngày)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú đơn hàng</label>
                <textarea
                  name="notes"
                  value={orderForm.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ghi chú thêm về đơn hàng (không bắt buộc)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>
          
          {/* Cart Items */}
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <img
                  src={getBookImageUrl(item)}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded"
                  data-book-id={item.id}
                  onError={(e) => handleImageError(e, item.title)}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>{item.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">SL: {item.quantity || 1}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(item.price * (item.quantity || 1))}
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

          {/* Order Summary */}
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
              <span>Thuế (10%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Tổng cộng:</span>
              <span className="text-red-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loading || !cart.length}
            className="w-full mt-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <FaLock />
                Đặt hàng ngay
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}