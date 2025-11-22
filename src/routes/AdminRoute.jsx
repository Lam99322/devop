import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, token, isLoading } = useContext(AuthContext);

  // Debug user info
  console.log("🔧 AdminRoute - User:", user);
  console.log("🔧 AdminRoute - Token:", token ? "exists" : "missing");

  if (isLoading) return <div>Loading...</div>;

  if (!token) return <Navigate to="/login" replace />;

  // Check multiple possible role structures
  let isAdmin = false;
  
  console.log("🔍 Checking admin roles:");
  console.log("- user?.role:", user?.role);
  console.log("- user?.roles:", user?.roles);

  if (user?.role === "ADMIN") {
    isAdmin = true;
    console.log("✅ Admin via user.role");
  } else if (user?.roles?.some(role => role.name === "ADMIN")) {
    isAdmin = true;
    console.log("✅ Admin via user.roles.name");
  } else if (user?.roles?.includes("ADMIN")) {
    isAdmin = true;
    console.log("✅ Admin via user.roles array");
  } else {
    console.log("❌ No admin role found");
  }

  if (!isAdmin) {
    console.log("⚠️ USER ACCESSING ADMIN - For testing 403 errors");
    // Temporarily allow non-admin access for testing
    // return <Navigate to="/" replace />;
  }
  
  console.log("🎉 Admin access granted!");

  return children;
}
