// // src/App.jsx
// import React from "react";
// import { BrowserRouter } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import CartProvider from "./context/CartContext";
// import AppRoutes from "./routes/AppRoutes";

// function App() {
//   return (
//     <AuthProvider>
//       <CartProvider>
//         <BrowserRouter>
//           <AppRoutes />
//         </BrowserRouter>
//       </CartProvider>
//     </AuthProvider>
//   );
// }

// export default App;
// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";


export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
