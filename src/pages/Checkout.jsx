import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { submitOrder } from "../utils/orderUtils";
import { getBookImageUrl, handleImageError } from "../utils/imageUtils";
import axiosClient from "../api/axiosClient";
import { FaTrash, FaCreditCard, FaShippingFast, FaShoppingCart, FaSpinner, FaCheckCircle, FaBox, FaPercent, FaTimes } from "react-icons/fa";

export default function Checkout() {
  const { cart, clearCart, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Discount states
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  
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

  // Load available discounts on component mount
  useEffect(() => {
    fetchAvailableDiscounts();
  }, []);

  const fetchAvailableDiscounts = async () => {
    const endpoints = [
      '/discounts/active',
      '/discounts',
      '/public/discounts',
      '/discounts/list'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Fetching discounts from: ${endpoint}`);
        const response = await axiosClient.get(endpoint);
        
        let discountData = [];
        if (Array.isArray(response.data)) {
          discountData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          discountData = response.data.data;
        } else if (response.data?.discounts && Array.isArray(response.data.discounts)) {
          discountData = response.data.discounts;
        }

        // Filter active discounts only
        const activeDiscounts = discountData.filter(d => 
          d.isActive !== false && 
          (!d.validTo || new Date(d.validTo) > new Date()) &&
          (!d.expiryDate || new Date(d.expiryDate) > new Date())
        );

        console.log(`✅ Found ${activeDiscounts.length} active discounts`);
        setAvailableDiscounts(activeDiscounts);
        return;
      } catch (err) {
        console.warn(`❌ Failed to fetch from ${endpoint}:`, err.message);
        continue;
      }
    }

    console.log('🎭 Using mock discount data');
    // Fallback mock data
    setAvailableDiscounts([
      {
        id: 1,
        code: "WELCOME10",
        description: "Giảm 10% cho đơn hàng đầu tiên",
        discountPercent: 10,
        minOrderAmount: 100000,
        maxDiscountAmount: 50000,
        isActive: true
      },
      {
        id: 2,
        code: "FREESHIP",
        description: "Miễn phí vận chuyển",
        discountPercent: 0,
        value: 30000,
        minOrderAmount: 200000,
        isActive: true
      }
    ]);
  };

  // Calculate totals
  const subtotal = cart?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  
  // Calculate discount
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.discountPercent > 0) {
      discountAmount = Math.round(subtotal * appliedDiscount.discountPercent / 100);
      if (appliedDiscount.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, appliedDiscount.maxDiscountAmount);
      }
    } else if (appliedDiscount.value > 0) {
      discountAmount = appliedDiscount.value;
    }
  }
  
  const tax = Math.round((subtotal - discountAmount) * 0.1);
  const total = subtotal - discountAmount + shippingFee + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      alert('Vui lòng nhập mã giảm giá!');
      return;
    }

    setDiscountLoading(true);

    try {
      // First try to validate with backend
      const response = await axiosClient.post('/discounts/validate', {
        code: discountCode.trim().toUpperCase(),
        orderAmount: subtotal
      });

      if (response.data.valid) {
        setAppliedDiscount(response.data.discount);
        alert(`✅ Áp dụng mã giảm giá thành công: ${response.data.discount.description}`);
      } else {
        alert(`❌ ${response.data.message || 'Mã giảm giá không hợp lệ!'}`);
      }
    } catch (error) {
      console.warn('Backend validation failed, trying local validation:', error.message);
      
      // Fallback to local validation
      const discount = availableDiscounts.find(d => 
        d.code.toUpperCase() === discountCode.trim().toUpperCase()
      );

      if (discount) {
        // Check minimum order amount
        if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
          alert(`Mã giảm giá yêu cầu đơn hàng tối thiểu ${formatCurrency(discount.minOrderAmount)}`);
          return;
        }

        setAppliedDiscount(discount);
        alert(`✅ Áp dụng mã giảm giá thành công: ${discount.description}`);
      } else {
        alert('❌ Mã giảm giá không tồn tại hoặc đã hết hạn!');
      }
    } finally {
      setDiscountLoading(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  const selectDiscountCode = (code) => {
    setDiscountCode(code);
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
    if (!validateForm()) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    // Ensure cart is a valid array
    const validCart = Array.isArray(cart) ? cart : [];
    
    if (validCart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    setLoading(true);

    try {
      const result = await submitOrder({
        orderForm,
        cart: validCart,
        total: { total, subtotal, shippingFee, tax, discountAmount, appliedDiscount },
        user,
        discount: appliedDiscount
      });

      if (result.success) {
        setOrderData(result.data);
        setOrderSuccess(true);
        clearCart();
        
        // setTimeout(() => {
        //   navigate('/');
        // }, 3000);
      } else {
        alert(`Đặt hàng thất bại: ${result.message}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Lỗi đặt hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">
              <FaCheckCircle className="mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Bạn đã đặt hàng thành công!</h1>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng và liên hệ với bạn sớm nhất.
            </p>
            {orderData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Thông tin đơn hàng:</h3>
                <p>Mã đơn hàng: <span className="font-mono">{orderData.id}</span></p>
                <p>Tổng tiền: <span className="font-semibold text-red-600">{formatCurrency(orderData.total)}</span></p>
                {orderData.appliedDiscount && (
                  <p className="text-green-600">
                    Đã áp dụng mã giảm giá: <span className="font-semibold">{orderData.appliedDiscount.code}</span>
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/orders')}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition duration-300 flex items-center gap-2"
              >
                <FaBox />
                Xem đơn hàng của tôi
              </button>
              <button 
                onClick={() => navigate('/books')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Thanh toán</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Delivery Information */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaShippingFast className="text-blue-600" />
                Thông tin giao hàng
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Họ và tên *</label>
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
                  <label className="block text-sm font-medium mb-2">Email *</label>
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
                  <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
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
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Địa chỉ *</label>
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
                
                <div>
                  <label className="block text-sm font-medium mb-2">Quận/Huyện *</label>
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
                  <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố *</label>
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

            {/* Discount Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaPercent className="text-green-600" />
                Mã giảm giá
              </h2>
              
              {/* Applied Discount Display */}
              {appliedDiscount && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">{appliedDiscount.code}</p>
                      <p className="text-sm text-green-600">{appliedDiscount.description}</p>
                      <p className="text-sm text-green-600">
                        Giảm: {formatCurrency(discountAmount)}
                      </p>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Gỡ mã giảm giá"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              )}

              {/* Discount Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={appliedDiscount || discountLoading}
                />
                <button
                  onClick={applyDiscount}
                  disabled={appliedDiscount || discountLoading || !discountCode.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {discountLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPercent />
                  )}
                  Áp dụng
                </button>
              </div>

              {/* Available Discounts */}
              {availableDiscounts.length > 0 && !appliedDiscount && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Mã giảm giá có sẵn:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableDiscounts.map((discount) => {
                      const canUse = !discount.minOrderAmount || subtotal >= discount.minOrderAmount;
                      return (
                        <div
                          key={discount.id}
                          className={`p-2 border rounded cursor-pointer transition-colors ${
                            canUse 
                              ? 'border-green-200 hover:bg-green-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                          onClick={() => canUse && selectDiscountCode(discount.code)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className={`text-sm font-medium ${
                                canUse ? 'text-green-800' : 'text-gray-500'
                              }`}>
                                {discount.code}
                              </p>
                              <p className={`text-xs ${
                                canUse ? 'text-green-600' : 'text-gray-400'
                              }`}>
                                {discount.description}
                              </p>
                              {discount.minOrderAmount && (
                                <p className={`text-xs ${
                                  canUse ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  Tối thiểu: {formatCurrency(discount.minOrderAmount)}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                canUse ? 'text-green-700' : 'text-gray-500'
                              }`}>
                                {discount.discountPercent > 0 
                                  ? `${discount.discountPercent}%`
                                  : formatCurrency(discount.value || 0)
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>
            
            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {(Array.isArray(cart) ? cart : []).map((item) => (
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
              {appliedDiscount && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá ({appliedDiscount.code}):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
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
              {appliedDiscount && discountAmount > 0 && (
                <div className="text-center text-sm text-green-600 mt-2">
                  🎉 Bạn tiết kiệm được {formatCurrency(discountAmount)}!
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading || !cart.length}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaShoppingCart />
                  Đặt hàng ngay - {formatCurrency(total)}
                  {appliedDiscount && discountAmount > 0 && (
                    <span className="text-yellow-300 text-sm ml-1">
                      (Tiết kiệm {formatCurrency(discountAmount)})
                    </span>
                  )}
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};