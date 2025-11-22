// src/routes/AppRoutes.jsx
import React from "react";
import { useRoutes } from "react-router-dom";

// USER PAGES
import Home from "../pages/Home";
import Books from "../pages/Books";
import BookDetail from "../pages/BookDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import Profile from "../pages/Profile";
import Discounts from "../pages/Discounts";

// LAYOUTS
import AppLayout from "../layouts/AppLayout";
import AdminLayout from "../layouts/AdminLayout";

// ADMIN PAGES
import Dashboard from "../pages/Admin/Dashboard";
import ManageBooks from "../pages/Admin/ManageBooks";
import ManageOrders from "../pages/Admin/ManageOrders";

// ROUTE GUARDS
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

export default function AppRoutes() {
  return useRoutes([
    // ============================
    // USER LAYOUT (AppLayout)
    // ============================
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "books", element: <Books /> },
        { path: "books/:slug", element: <BookDetail /> },

        {
          path: "cart",
          element: (
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          ),
        },
        {
          path: "checkout",
          element: (
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          ),
        },
        {
          path: "orders",
          element: (
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          ),
        },
        {
          path: "auth/me",
          element: (
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          ),
        },
        { path: "discounts", element: <Discounts /> },
      ],
    },

    // ============================
    // ADMIN LAYOUT
    // ============================
    {
      path: "/admin",
      element: (
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      ),
      children: [
        { index: true, element: <Dashboard /> },
        { path: "books", element: <ManageBooks /> },
        { path: "orders", element: <ManageOrders /> },
      ],
    },

    // ============================
    // AUTH PAGES
    // ============================
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
  ]);
}
