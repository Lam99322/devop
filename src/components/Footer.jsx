// src/components/Footer.tsx
import React from "react";
import "../layouts/AppLayout.css";
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-10 p-6">
      <div className="container mx-auto text-center">
        <p>© 2025 BookStore. All rights reserved.</p>
        <p className="mt-2 text-sm text-gray-400">
          Hỗ trợ: hotro@bookstore.com | 0123456789
        </p>
      </div>
    </footer>
  );
}
