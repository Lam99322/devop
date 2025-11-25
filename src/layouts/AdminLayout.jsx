// src/layouts/AdminLayout.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-2">
          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin">
            Dashboard
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/users">
            Users
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/orders">
            Orders
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/books">
            Books
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/categories">
            Categories
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/publishers">
            Publishers
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/discounts">
            Discounts
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/reviews">
            Reviews
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/roles">
            Roles
          </Link>

          <Link className="block p-2 hover:bg-gray-200 rounded" to="/admin/permissions">
            Permissions
          </Link>

          <hr className="my-2" />
          
          <Link className="block p-2 hover:bg-gray-200 rounded text-purple-600 font-medium" to="/admin/api-test">
            🔧 API Tester
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
