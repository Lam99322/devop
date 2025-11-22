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
import DebugPanel from "./components/DebugPanel";
import ErrorBoundary from "./components/ErrorBoundary";

// Import debug functions (development only)
if (process.env.NODE_ENV === 'development') {
  import('./api/debugAPI.js').then(debug => {
    window.debugUserMeAPI = debug.debugUserMeAPI;
    window.debugLogin = debug.debugLogin;
    console.log("🔧 Debug functions loaded: debugLogin(), debugUserMeAPI()");
  });
}


export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            {/* Tất cả route (user + admin) */}
            <AppRoutes />
            
            {/* Debug panel (chỉ trong dev mode) */}
            <DebugPanel />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
