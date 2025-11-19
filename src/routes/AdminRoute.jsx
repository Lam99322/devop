import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../../bookstore-frontend/src/context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return children;
}
