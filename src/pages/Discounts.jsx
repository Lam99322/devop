import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await axiosClient.get("/discounts");
      setDiscounts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      // Mock data for demo
      setDiscounts([
        {
          id: 1,
          code: "WELCOME10",
          description: "Giảm 10% cho đơn hàng đầu tiên",
          discountPercent: 10,
          minOrderAmount: 100000,
          maxDiscountAmount: 50000,
          validFrom: "2024-01-01",
          validTo: "2024-12-31",
          isActive: true
        },
        {
          id: 2,
          code: "FREESHIP",
          description: "Miễn phí vận chuyển cho đơn hàng trên 200k",
          discountPercent: 0,
          minOrderAmount: 200000,
          maxDiscountAmount: 30000,
          validFrom: "2024-01-01",
          validTo: "2024-12-31",
          isActive: true
        },
        {
          id: 3,
          code: "SUMMER20",
          description: "Giảm 20% cho mùa hè",
          discountPercent: 20,
          minOrderAmount: 300000,
          maxDiscountAmount: 100000,
          validFrom: "2024-06-01",
          validTo: "2024-08-31",
          isActive: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    });
  };

  const isExpired = (validTo) => {
    return new Date(validTo) < new Date();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Mã giảm giá
        </h1>
        <p className="text-gray-600">
          Các mã khuyến mại hiện có và cách sử dụng
        </p>
      </div>

      {discounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có mã giảm giá nào
          </h3>
          <p className="text-gray-500 mb-6">
            Hiện tại chưa có mã khuyến mại nào. Hãy theo dõi để nhận thông báo!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => {
            const expired = isExpired(discount.validTo);
            const inactive = !discount.isActive;
            
            return (
              <div
                key={discount.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                  expired || inactive 
                    ? 'border-gray-300 bg-gray-50' 
                    : 'border-green-200 hover:border-green-400'
                } transition-colors`}
              >
                <div className={`p-4 ${expired || inactive ? 'bg-gray-100' : 'bg-gradient-to-r from-green-500 to-blue-600'} text-white`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-bold ${expired || inactive ? 'text-gray-600' : ''}`}>
                      {discount.code}
                    </h3>
                    {expired && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Hết hạn
                      </span>
                    )}
                    {inactive && !expired && (
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                        Không khả dụng
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${expired || inactive ? 'text-gray-500' : 'text-green-100'}`}>
                    {discount.discountPercent > 0 
                      ? `Giảm ${discount.discountPercent}%`
                      : 'Ưu đãi đặc biệt'
                    }
                  </p>
                </div>

                <div className="p-4">
                  <p className={`text-sm mb-3 ${expired || inactive ? 'text-gray-500' : 'text-gray-700'}`}>
                    {discount.description}
                  </p>

                  <div className={`space-y-2 text-xs ${expired || inactive ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex justify-between">
                      <span>Đơn tối thiểu:</span>
                      <span className="font-semibold">
                        {discount.minOrderAmount?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    {discount.maxDiscountAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Giảm tối đa:</span>
                        <span className="font-semibold">
                          {discount.maxDiscountAmount?.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Có hiệu lực:</span>
                      <span>
                        {new Date(discount.validFrom).toLocaleDateString('vi-VN')} - {new Date(discount.validTo).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(discount.code)}
                    disabled={expired || inactive}
                    className={`w-full mt-4 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      expired || inactive
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : copiedCode === discount.code
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copiedCode === discount.code
                      ? '✓ Đã sao chép!'
                      : expired || inactive
                      ? 'Không khả dụng'
                      : 'Sao chép mã'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📋 Hướng dẫn sử dụng mã giảm giá
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">1.</span>
            Thêm sản phẩm vào giỏ hàng và tiến hành thanh toán
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">2.</span>
            Nhập mã giảm giá vào ô "Mã khuyến mại" tại trang thanh toán
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">3.</span>
            Nhấn "Áp dụng" để hệ thống tính toán lại tổng tiền
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">4.</span>
            Hoàn tất đơn hàng để nhận ưu đãi
          </li>
        </ul>
      </div>
    </div>
  );
}