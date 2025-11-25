// Simple order submission without user verification
import axiosClient from "../api/axiosClient";

export const submitOrderSimple = async (cart, orderForm, totals, user = null) => {
  // Basic validation
  if (!cart || cart.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  // Validate required fields
  if (!orderForm.fullName?.trim()) throw new Error("Tên người nhận không được để trống");
  if (!orderForm.phone?.trim()) throw new Error("Số điện thoại người nhận không được để trống");
  if (!orderForm.address?.trim()) throw new Error("Địa chỉ không được để trống");

  // If no user, allow anonymous orders
  if (!user || !user.id) {
    console.log("⚠️ No user provided, creating anonymous order");
  }

  console.log("👤 User info for order:", user);

  // Format order data - make userId optional for anonymous orders
  const orderData = {
    userId: user?.id ? String(user.id) : null, // Allow null for anonymous orders
    receiverName: orderForm.fullName?.trim(),  
    receiverPhone: orderForm.phone?.trim(),
    address: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
    paymentMethod: orderForm.paymentMethod?.toUpperCase() || "CASH_ON_DELIVERY",
    total: parseFloat(totals.total.toFixed(2)), // Double 
    orderDetails: cart.map(item => ({
      bookId: String(item.id),                 // String
      quantity: parseInt(item.quantity || 1),  // Integer  
      price: parseFloat(item.price.toFixed(2)) // Double
    }))
  };

  console.log(`📤 Submitting order:`, JSON.stringify(orderData, null, 2));

  // Try endpoints based on ManageOrders pattern
  const endpoints = [
    "/orders",           // Most likely - matches the pattern used in ManageOrders
    "/orders/add",       // Alternative pattern
    "/orders/create",    // Alternative pattern  
    "/api/orders",       // With /api prefix
    "/api/orders/add",   // With /api prefix + add
    "/api/orders/create" // With /api prefix + create
  ];

  let lastError = null;

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    
    try {
      console.log(`📤 Trying endpoint ${i + 1}/${endpoints.length}: POST ${endpoint}`);
      
      const response = await axiosClient.post(endpoint, orderData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });
      
      console.log(`✅ Order submitted successfully via ${endpoint}:`, response.data);
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || "Đơn hàng đã được tạo thành công!",
        endpoint: endpoint
      };
      
    } catch (error) {
      console.error(`❌ Failed ${endpoint}:`, error.response?.status, error.response?.data || error.message);
      lastError = error;
      continue;
    }
  }

  // All endpoints failed
  console.error(`❌ All ${endpoints.length} endpoints failed. Last error:`, lastError?.response?.data || lastError?.message);
  
  let errorMsg = "Không thể tạo đơn hàng";
  
  if (lastError?.response?.status === 400) {
    const backendMsg = lastError?.response?.data?.message || lastError?.response?.data?.error;
    errorMsg = `Dữ liệu đơn hàng không hợp lệ: ${backendMsg}`;
  } else if (lastError?.response?.status === 401) {
    errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
  } else if (lastError?.response?.status === 403) {
    errorMsg = "Không có quyền tạo đơn hàng. Vui lòng liên hệ admin.";
  } else if (lastError?.response?.status === 404) {
    errorMsg = `API tạo đơn hàng không tồn tại. Đã thử ${endpoints.length} endpoints:\n${endpoints.map(ep => `- POST ${ep}`).join('\n')}\n\nKiểm tra Spring Boot OrderController có các endpoints này không?`;
  } else if (lastError?.response?.status === 500) {
    errorMsg = "Lỗi server backend. Kiểm tra Spring Boot logs.";
  } else if (!lastError?.response) {
    errorMsg = "Không kết nối được backend. Kiểm tra Spring Boot có đang chạy?";
  }
  
  throw new Error(errorMsg);
};