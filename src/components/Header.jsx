import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isLoading } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${searchTerm}`);
  };

  const handleLogout = (clearData = false) => {
    logout(clearData);
    navigate("/");
  };

  return (
    <header className="w-full shadow bg-green-600">
      {/* TOP INFO BAR */}
      <div className="bg-green-700 text-white text-sm py-1 px-4 flex justify-end gap-4">
        <span>Giỏ hàng ({cart?.length || 0}) ♥</span>
        <span>☎ Hotline: 0938 424 289</span>
      </div>

      {/* MAIN HEADER */}
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">
        {/* LOGO */}
        <Link to="/" className="text-3xl font-bold text-white tracking-wider">
          Nooita.vn
        </Link>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl mx-6 flex bg-white rounded overflow-hidden border"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 outline-none text-gray-700"
            placeholder="Tìm kiếm sách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-green-600 px-5 text-white flex items-center justify-center">
            <FaSearch />
          </button>
        </form>

        {/* ICONS */}
        <div className="flex items-center gap-4 text-white relative">
          {/* Cart */}
          <Link to="/cart" className="relative text-2xl hover:text-green-200 transition-colors">
            <FaShoppingCart />
            {cart?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>

          {/* User Account */}
          {isLoading ? (
            <div className="px-3 py-1 text-sm bg-green-500 rounded animate-pulse">...</div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-400 px-3 py-1 rounded transition-colors"
              >
                <FaUserCircle />
                <span className="hidden sm:block">{user.username || user.name}</span>
                <FaChevronDown className="text-xs ml-1" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded shadow-lg z-50">
                  <Link
                    to="/auth/me"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setAccountOpen(false)}
                  >
                    Thông tin tài khoản
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setAccountOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  <Link
                    to="/discounts"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setAccountOpen(false)}
                  >
                    Mã giảm giá
                  </Link>
                  {/* Admin Link - Only show for admin users */}
                  {(user?.role === "ADMIN" || 
                    user?.roles?.some(role => role.name === "ADMIN") || 
                    user?.roles?.includes("ADMIN")) && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 hover:bg-gray-100 text-blue-600 font-semibold"
                      onClick={() => setAccountOpen(false)}
                    >
                      🔧 Quản trị hệ thống
                    </Link>
                  )}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={() => {
                        logout(false); // Keep user data
                        navigate("/");
                        setAccountOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      🚪 Đăng xuất (giữ dữ liệu)
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Xóa hết dữ liệu cá nhân? (giỏ hàng, lịch sử...)")) {
                          logout(true); // Clear all data
                          navigate("/");
                          setAccountOpen(false);
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                    >
                      🗑️ Đăng xuất & xóa dữ liệu
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-400 px-3 py-1 rounded transition-colors"
            >
              <FaUserCircle />
              <span className="hidden sm:block">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
