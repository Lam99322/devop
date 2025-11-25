// src/utils/orderUtils.js
import axiosClient from "../api/axiosClient";

// Helper function to convert UUID to integer bookId
const convertBookId = (id, itemTitle = 'Unknown') => {
  if (typeof id === 'string' && id.includes('-')) {
    // UUID case - convert to hash number
    const bookId = Math.abs(id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)) % 1000000; // Keep it reasonable
    console.log(`🔄 Converting UUID ${id} to bookId: ${bookId} for "${itemTitle}"`);
    return bookId;
  } else {
    return Number(id);
  }
};

export const submitOrder = async ({ orderForm, cart, total: totals, user }) => {
  console.log("🚀 NEW submitOrder function called!");
  
  // Ensure cart is a valid array
  const validCart = Array.isArray(cart) ? cart : [];
  
  // Basic validation
  if (validCart.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  // Validate cart items
  for (let item of validCart) {
    if (!item.id || item.id === null || item.id === undefined || item.id === '' || item.id === 'null') {
      throw new Error(`Sản phẩm "${item.title || 'Unknown'}" thiếu ID. Vui lòng xóa và thêm lại vào giỏ hàng.`);
    }
    if (!item.price || item.price <= 0) {
      throw new Error(`Sản phẩm "${item.title || 'Unknown'}" có giá không hợp lệ.`);
    }
    
    // Log ID type for debugging
    if (typeof item.id === 'string' && item.id.includes('-')) {
      console.log(`⚠️ Found UUID bookId: ${item.id} for "${item.title}" - will convert to number`);
    } else {
      console.log(`✅ Valid bookId: ${item.id} for "${item.title}"`);
    }
  }

  // Validate required fields
  if (!orderForm.fullName?.trim()) throw new Error("Họ tên không được để trống");
  if (!orderForm.email?.trim()) throw new Error("Email không được để trống");
  if (!orderForm.phone?.trim()) throw new Error("Số điện thoại không được để trống");
  if (!orderForm.address?.trim()) throw new Error("Địa chỉ không được để trống");
  if (!orderForm.district?.trim()) throw new Error("Quận/Huyện không được để trống");
  if (!orderForm.city?.trim()) throw new Error("Tỉnh/Thành phố không được để trống");

  // Get correct userId from /users/me API
  let actualUserId = null;
  try {
    console.log("🔍 Getting userId from /users/me API...");
    const userResponse = await axiosClient.get('/users/me');
    actualUserId = userResponse.data?.data?.id;
    console.log("✅ Got userId from API:", actualUserId);
  } catch (error) {
    console.error("❌ Failed to get user info:", error.response?.data);
    console.log("⚠️ Proceeding without userId (user might not be logged in)");
    actualUserId = null;
  }

  // EXACT OrderCreationRequest based on actual backend response structure
  const orderCreationRequest = {
    userId: actualUserId, // Correct UUID from /users/me API like "d11f3cf0-4173-4751-9daa-ccde558c5303"
    receiverName: orderForm.fullName?.trim(),
    receiverPhone: orderForm.phone?.trim(),
    address: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
    paymentMethod: orderForm.paymentMethod === 'cod' ? "COD" : "BANK_TRANSFER", 
    total: Number(totals.total),
    orderDetails: validCart.map(item => ({
      bookId: String(item.id), // UUID string like "ff0b4555-743e-49df-9f9f-1abdd998419b"
      quantity: parseInt(item.quantity || 1),
      price: parseFloat(item.price)
    }))
  };
  
  console.log("🧪 EXACT OrderCreationRequest (based on orderlist response):", JSON.stringify(orderCreationRequest, null, 2));
  console.log("📝 Sample cart items for reference:", validCart.map(item => ({
    id: item.id,
    title: item.title,
    price: item.price,
    quantity: item.quantity
  })));
  
  try {
    console.log("📤 Sending EXACT OrderCreationRequest to backend...");
    const response = await axiosClient.post('/orders', orderCreationRequest);
    console.log("✅ OrderCreationRequest SUCCESS:", response.data);
    
    // Cache the new order for the current user
    if (actualUserId && response.data) {
      try {
        const cachedOrders = localStorage.getItem(`userOrders_${actualUserId}`);
        const userOrders = cachedOrders ? JSON.parse(cachedOrders) : [];
        
        // Add the new order to the beginning of the list
        userOrders.unshift(response.data);
        
        // Keep only the last 50 orders to avoid localStorage bloat
        const limitedOrders = userOrders.slice(0, 50);
        
        localStorage.setItem(`userOrders_${actualUserId}`, JSON.stringify(limitedOrders));
        console.log(`💾 Added new order to user ${actualUserId} cache. Total cached: ${limitedOrders.length}`);
      } catch (cacheError) {
        console.warn("Failed to cache new order:", cacheError);
      }
    }
    
    return {
      success: true,
      data: response.data,
      message: "Đặt hàng thành công!"
    };
  } catch (error) {
    console.error("❌ OrderCreationRequest failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      sentPayload: orderCreationRequest
    });
    
    const backendError = error.response?.data;
    console.log("🔍 Backend Error Details:", JSON.stringify(backendError, null, 2));
    
    // If still fails, the issue might be:
    if (backendError?.code === 9999) {
      console.log("🚨 Possible causes for 'Uncategorized error':");
      console.log("1. BookId UUIDs in cart don't exist in Books table");
      console.log("2. UserId UUID doesn't exist in Users table"); 
      console.log("3. PaymentMethod enum mismatch");
      console.log("4. Internal validation or database constraint error");
      console.log("5. Backend service logic error in orderService.save()");
      
      // Log the exact values being sent for debugging
      console.log("🔍 Debugging info:");
      console.log("- userId:", orderCreationRequest.userId);
      console.log("- paymentMethod:", orderCreationRequest.paymentMethod);
      console.log("- bookIds being sent:", orderCreationRequest.orderDetails.map(od => od.bookId));
      
      throw new Error(`Create order failed: ${backendError.message}. Check console for debugging details.`);
    }
  }

  // If main request fails, provide clear error message
  throw new Error("Order creation failed with exact backend format. Check console for details.");



  // Fallback formats if exact OrderCreationRequest fails
  const possibleFormats = [
    // Format 0: Try without userId
    {
      receiverName: orderForm.fullName?.trim(),
      receiverPhone: orderForm.phone?.trim(),
      address: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
      paymentMethod: orderForm.paymentMethod === 'cod' ? "COD" : "BANK_TRANSFER",
      total: Number(totals.total),
      orderDetails: validCart.map(item => ({
        bookId: String(item.id), // Keep String as per OrderDetailRequest
        quantity: parseInt(item.quantity || 1), // Keep Integer
        price: parseFloat(item.price) // Keep Double
      }))
    },
    // Format 0.1: Try different OrderDetail structure + different enum
    {
      userId: user?.id ? String(user.id) : null,
      receiverName: orderForm.fullName?.trim(),
      receiverPhone: orderForm.phone?.trim(),  
      address: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
      paymentMethod: (orderForm.paymentMethod === 'cod') ? "CASH_ON_DELIVERY" : "BANK_TRANSFER",
      total: Number(totals.total),
      orderDetails: validCart.map(item => ({
        bookId: convertBookId(item.id, item.title),
        quantity: Number(item.quantity || 1),
        price: Number(item.price)  // Try 'price' instead of 'unitPrice'
      }))
    },
    // Format 0.2: Try without userId + simpler enum
    {
      receiverName: orderForm.fullName?.trim(),
      receiverPhone: orderForm.phone?.trim(),
      address: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
      paymentMethod: (orderForm.paymentMethod === 'cod') ? "COD" : "BANK",
      total: Number(totals.total),
      orderDetails: validCart.map(item => ({
        bookId: convertBookId(item.id, item.title),
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.price)
      }))
    },
    // Format 0.3: Try PaymentMethod.CASH_ON_DELIVERY exactly
    {
      userId: user?.id ? String(user.id) : null,
      receiverName: orderForm.fullName?.trim(),
      receiverPhone: orderForm.phone?.trim(),
      address: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
      paymentMethod: (orderForm.paymentMethod === 'cod') ? "CASH_ON_DELIVERY" : "BANK_TRANSFER",
      total: Number(totals.total),
      orderDetails: validCart.map(item => ({
        bookId: convertBookId(item.id, item.title),
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.price)
      }))
    },
    // Format 1: Standard naming (fallback)
    {
      customerName: orderForm.fullName?.trim(),
      customerEmail: orderForm.email?.trim(), 
      customerPhone: orderForm.phone?.trim(),
      shippingAddress: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
      paymentMethod: (orderForm.paymentMethod === 'cod') ? "CASH_ON_DELIVERY" : "BANK_TRANSFER",
      deliveryMethod: (orderForm.deliveryMethod === 'standard') ? "STANDARD_DELIVERY" : "EXPRESS_DELIVERY",
      notes: orderForm.notes?.trim() || null,
      totalAmount: Number(totals.total),
      orderDetails: validCart.map(item => {
        const bookId = convertBookId(item.id, item.title);
        const quantity = Number(item.quantity || 1);
        const unitPrice = Number(item.price);
        
        if (!bookId || isNaN(bookId) || bookId <= 0) {
          throw new Error(`Book ID không hợp lệ cho sản phẩm "${item.title}": ${item.id} -> ${bookId}`);
        }
        if (!quantity || isNaN(quantity) || quantity <= 0) {
          throw new Error(`Số lượng không hợp lệ cho sản phẩm "${item.title}": ${item.quantity}`);
        }
        if (!unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
          throw new Error(`Giá không hợp lệ cho sản phẩm "${item.title}": ${item.price}`);
        }
        
        return { bookId, quantity, unitPrice };
      })
    },
    // Format 2: Alternative naming
    {
      fullName: orderForm.fullName?.trim(),
      email: orderForm.email?.trim(), 
      phone: orderForm.phone?.trim(),
      address: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
      paymentMethod: (orderForm.paymentMethod === 'cod') ? "CASH_ON_DELIVERY" : "BANK_TRANSFER",
      deliveryMethod: (orderForm.deliveryMethod === 'standard') ? "STANDARD_DELIVERY" : "EXPRESS_DELIVERY",
      notes: orderForm.notes?.trim() || null,
      total: Number(totals.total),
      items: validCart.map(item => ({
        bookId: convertBookId(item.id, item.title),
        quantity: Number(item.quantity || 1),
        price: Number(item.price)
      }))
    },
    // Format 3: User-based
    {
      userId: user?.id || null,
      shippingAddress: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
      paymentMethod: (orderForm.paymentMethod === 'cod') ? "CASH_ON_DELIVERY" : "BANK_TRANSFER",
      deliveryMethod: (orderForm.deliveryMethod === 'standard') ? "STANDARD_DELIVERY" : "EXPRESS_DELIVERY",
      notes: orderForm.notes?.trim() || null,
      totalAmount: Number(totals.total),
      orderDetails: validCart.map(item => ({
        bookId: convertBookId(item.id, item.title),
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.price)
      }))
    },
    // Format 4: Simple naming
    {
      name: orderForm.fullName?.trim(),
      email: orderForm.email?.trim(),
      phone: orderForm.phone?.trim(),
      address: `${orderForm.address?.trim()}, ${orderForm.district?.trim()}, ${orderForm.city?.trim()}`,
      payment: (orderForm.paymentMethod === 'cod') ? "COD" : "BANK",
      delivery: (orderForm.deliveryMethod === 'standard') ? "STANDARD" : "EXPRESS",
      total: Number(totals.total),
      items: validCart.map(item => ({
        id: convertBookId(item.id, item.title),
        qty: Number(item.quantity || 1),
        price: Number(item.price)
      }))
    },
    // Format 5: Minimal required fields only
    {
      total: Number(totals.total),
      items: validCart.map(item => ({
        bookId: convertBookId(item.id, item.title),
        quantity: Number(item.quantity || 1)
      }))
    }
  ];
  
  // Try each format until one works
  for (let i = 0; i < possibleFormats.length; i++) {
    const orderData = { ...possibleFormats[i] };

    // Add userId if user is logged in (optional theo backend)
    if (user?.id) {
      orderData.userId = String(user.id);
    }

    console.log(`📤 Trying format ${i + 1}/${possibleFormats.length}:`, orderData);
    
    if (i === 0) {
      console.log('🎯 Using EXACT backend DTO format (OrderCreationRequest) - unitPrice variant');
    } else if (i === 1) {
      console.log('🎯 Using EXACT backend DTO format (OrderCreationRequest) - price variant');  
    } else if (i === 2) {
      console.log('🎯 Using EXACT backend DTO format (OrderCreationRequest) - no userId variant');
    }

    // Endpoint chính xác từ OrderController: @PostMapping("/orders")
    const endpoint = "/orders";

    try {
      console.log(`🔍 Data validation for format ${i + 1}:`, {
        hasCustomerName: !!orderData.customerName,
        hasFullName: !!orderData.fullName,
        hasEmail: !!orderData.customerEmail || !!orderData.email,
        totalAmount: typeof orderData.totalAmount || typeof orderData.total,
        orderDetailsCount: orderData.orderDetails?.length || orderData.items?.length,
        firstItem: orderData.orderDetails?.[0] || orderData.items?.[0]
      });
      
      const response = await axiosClient.post(endpoint, orderData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });
      
      console.log(`✅ Order created successfully with format ${i + 1}:`, response.data);
      
      // Backend trả về ApiResponse<OrderResponse>
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || "Order created successfully"
      };
      
    } catch (error) {
      console.error(`❌ Format ${i + 1} failed:`, {
        status: error.response?.status,
        data: error.response?.data,
        sentData: orderData
      });

      // If this is the last format, throw the error
      if (i === possibleFormats.length - 1) {
        let errorMsg = "Không thể tạo đơn hàng với bất kỳ format nào";
        
        if (error.response?.status === 404) {
          errorMsg = "Backend không có API tạo đơn hàng. Kiểm tra OrderController và Spring Boot.";
        } else if (error.response?.status === 400) {
          const backendMsg = error.response?.data?.message || error.response?.data?.error;
          const violations = error.response?.data?.violations || error.response?.data?.details;
          
          console.error("🔍 Final 400 Error Details:", {
            sentData: orderData,
            backendError: error.response?.data,
            violations: violations,
            allFormatsTried: possibleFormats.length
          });
          
          // More specific error message
          if (violations && Array.isArray(violations)) {
            const violationMsgs = violations.map(v => v.message || v).join(', ');
            errorMsg = `Dữ liệu không hợp lệ (thử ${possibleFormats.length} formats): ${violationMsgs}`;
          } else {
            errorMsg = `Tất cả ${possibleFormats.length} formats đều thất bại: ${backendMsg || "Backend không chấp nhận format nào"}`;
          }
        } else if (error.response?.status === 401) {
          errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        } else if (error.response?.status === 500) {
          errorMsg = "Lỗi server backend. Kiểm tra Spring Boot logs.";
        } else if (!error.response) {
          errorMsg = "Không kết nối được backend. Kiểm tra Spring Boot có đang chạy không.";
        }
        
        throw new Error(errorMsg);
      }
      
      // Continue to next format
      console.log(`🔄 Format ${i + 1} failed, trying next format...`);
    }
  }
};


