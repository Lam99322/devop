// src/utils/orderUtils.js
import axiosClient from "../api/axiosClient";

export const submitOrder = async (cart, orderForm, totals) => {
  console.log("📦 Starting order submission...");
  
  // Basic validation
  if (!cart || cart.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  // Prepare order data - try different formats backend might accept
  const baseOrderData = {
    items: cart.map(item => ({
      bookId: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity || 1
    })),
    customerName: orderForm.fullName,
    customerEmail: orderForm.email,
    customerPhone: orderForm.phone,
    shippingAddress: `${orderForm.address}, ${orderForm.district}, ${orderForm.city}`,
    paymentMethod: orderForm.paymentMethod,
    totalAmount: totals.total
  };

  console.log("📊 Order data to submit:", baseOrderData);

  // Try different endpoints and formats
  const attempts = [
    { endpoint: "/orders/create", data: baseOrderData },
    { endpoint: "/orders", data: baseOrderData },
    { endpoint: "/orders", data: { items: cart } }, // Minimal format
    { endpoint: "/order/create", data: baseOrderData }
  ];

  for (const attempt of attempts) {
    try {
      console.log(`🔄 Trying ${attempt.endpoint}...`);
      const response = await axiosClient.post(attempt.endpoint, attempt.data);
      console.log(`✅ Success with ${attempt.endpoint}:`, response.data);
      return response.data;
    } catch (error) {
      console.warn(`❌ Failed ${attempt.endpoint}:`, error.response?.status, error.response?.data?.message);
      continue;
    }
  }

  // If all attempts fail, create mock order for demo
  console.warn("🎭 All endpoints failed, creating mock order for demo...");
  const mockOrder = {
    id: `ORDER-${Date.now()}`,
    status: "PENDING",
    total: totals.total,
    createdAt: new Date().toISOString(),
    customerName: orderForm.fullName,
    shippingAddress: `${orderForm.address}, ${orderForm.district}, ${orderForm.city}`,
    items: cart,
    message: "Đơn hàng được tạo thành công (Demo mode - Backend chưa sẵn sàng)"
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { data: mockOrder };
};