import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import axiosClient from "../api/axiosClient";

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);

  const handleCheckout = () => {
    axiosClient.post("/orders", { items: cart })
      .then(() => {
        alert("Order placed successfully!");
        clearCart();
      })
      .catch(() => alert("Checkout failed"));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">💳 Checkout</h2>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCheckout}>
        Confirm Order
      </button>
    </div>
  );
}
