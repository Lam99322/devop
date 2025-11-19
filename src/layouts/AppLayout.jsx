import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto flex gap-6 px-4 py-6 w-full">
        <div className="w-64 hidden lg:block">
          <Sidebar />
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
