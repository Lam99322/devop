import React from "react";
import { useRoutes } from "react-router-dom";
import Home from "../pages/Home";
import Books from "../pages/Books";
import BookDetail from "../pages/BookDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import AppLayout from "../layouts/AppLayout";
import Dashboard from "../pages/Admin/Dashboard";
import ManageBooks from "../pages/Admin/ManageBooks";
import ManageOrders from "../pages/Admin/ManageOrders";

import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

export default function AppRoutes() {
  return useRoutes([
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

        // Admin pages
        {
          path: "admin",
          element: (
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          ),
        },
        {
          path: "admin/books",
          element: (
            <AdminRoute>
              <ManageBooks />
            </AdminRoute>
          ),
        },
        {
          path: "admin/orders",
          element: (
            <AdminRoute>
              <ManageOrders />
            </AdminRoute>
          ),
        },
      ],
    },

    // Pages outside layout
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
  ]);
}
