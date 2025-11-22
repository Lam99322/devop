import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);

  const total = cart.reduce((sum, i) => sum + i.price * (i.quantity || i.qty || 0), 0);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">🛒 Giỏ hàng của bạn</h2>

      {cart.length === 0 ? (
        <div className="text-center py-10 bg-white shadow rounded-lg">
          <p className="text-gray-600 text-lg">Giỏ hàng đang trống.</p>
          <Link
            to="/"
            className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex items-center bg-white shadow p-4 rounded-lg"
              >
                {/* Ảnh sách */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-24 object-cover rounded"
                />

                {/* Info */}
                <div className="flex-1 ml-4">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-gray-600">${item.price}</p>

                  {/* Tăng giảm số lượng */}
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || item.qty || 1) - 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      disabled={(item.quantity || item.qty || 1) <= 1}
                    >
                      -
                    </button>

                    <span className="px-4">{item.quantity || item.qty || 1}</span>

                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || item.qty || 1) + 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 font-semibold hover:underline ml-4"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          {/* Tổng tiền + nút */}
          <div className="mt-6 p-4 bg-white shadow rounded-lg">
            <p className="text-xl font-bold">
              Tổng cộng: <span className="text-green-600">${total.toFixed(2)}</span>
            </p>

            <div className="mt-4 flex gap-3">
              <Link
                to="/checkout"
                className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Thanh toán
              </Link>

              <button
                onClick={clearCart}
                className="flex-1 text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
