import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🛒 Shopping Cart</h2>

      {cart.length === 0 ? <p>No items in cart</p> : (
        <>
          <ul className="space-y-2">
            {cart.map(item => (
              <li key={item.id} className="border p-2 flex justify-between">
                <span>{item.title} x {item.qty}</span>
                <button className="text-red-600" onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>

          <p className="mt-4 font-bold text-lg">Total: ${total}</p>
          <a href="/checkout" className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded">Checkout</a>
          <button onClick={clearCart} className="ml-2 text-red-600">Clear All</button>
        </>
      )}
    </div>
  );
}
