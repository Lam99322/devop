// src/utils/orderUtils.js
import axiosClient from "../api/axiosClient";

export const submitOrder = async (cart, orderForm, totals, user = null) => {
  // Basic validation
  if (!cart || cart.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  // Validate required fields
  if (!orderForm.fullName?.trim()) throw new Error("Họ tên không được để trống");
  if (!orderForm.email?.trim()) throw new Error("Email không được để trống");
  if (!orderForm.phone?.trim()) throw new Error("Số điện thoại không được để trống");
  if (!orderForm.address?.trim()) throw new Error("Địa chỉ không được để trống");
  if (!orderForm.district?.trim()) throw new Error("Quận/Huyện không được để trống");
  if (!orderForm.city?.trim()) throw new Error("Tỉnh/Thành phố không được để trống");

  // Format theo OrderCreationRequest DTO - variations để test
  const baseOrderData = {
    customerName: orderForm.fullName?.trim(),
    customerEmail: orderForm.email?.trim(),
    customerPhone: orderForm.phone?.trim(),
    shippingAddress: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
    paymentMethod: orderForm.paymentMethod?.toUpperCase(),
    deliveryMethod: orderForm.deliveryMethod?.toUpperCase(), 
    notes: orderForm.notes?.trim() || "",
    totalAmount: parseFloat(totals.total.toFixed(2)), // Try decimal
    orderDetails: cart.map(item => ({
      bookId: String(item.id),
      quantity: parseInt(item.quantity || 1),
      unitPrice: parseFloat(item.price.toFixed(2))
    }))
  };

  // Add userId if available
  const orderData = user?.id ? { ...baseOrderData, userId: String(user.id) } : baseOrderData;

  // Chỉ dùng endpoint chính xác từ OrderController
  const endpoint = "/orders"; // POST /orders từ @PostMapping

  try {
    console.log(`📤 Creating order with data:`, JSON.stringify(orderData, null, 2));
    console.log(`🎯 Target endpoint: POST ${endpoint}`);
    
    const response = await axiosClient.post(endpoint, orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });
    
    console.log(`✅ Order created successfully:`, response.data);
    
    // Backend trả về ApiResponse<OrderResponse>
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || "Đơn hàng đã được tạo thành công!"
    };
    
  } catch (error) {
    console.error(`❌ Failed to create order:`, {
      status: error.response?.status,
      data: error.response?.data,
      sentData: orderData
    });

    let errorMsg = "Không thể tạo đơn hàng";
    
    if (error.response?.status === 404) {
      errorMsg = "Backend không có API tạo đơn hàng. Kiểm tra OrderController và Spring Boot.";
    } else if (error.response?.status === 400) {
      const backendMsg = error.response?.data?.message || error.response?.data?.error;
      errorMsg = `Dữ liệu đơn hàng không hợp lệ: ${backendMsg || "Kiểm tra format OrderCreationRequest"}`;
      console.error("🔍 400 Error - Sent data vs Expected:", { sent: orderData, error: error.response?.data });
    } else if (error.response?.status === 401) {
      errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
    } else if (error.response?.status === 500) {
      errorMsg = "Lỗi server backend. Kiểm tra Spring Boot logs.";
    } else if (!error.response) {
      errorMsg = "Không kết nối được backend. Kiểm tra Spring Boot có đang chạy không.";
    }
    
    throw new Error(errorMsg);
  }
};