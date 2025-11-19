import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

export default function Header() {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { user, logout, isLoading } = useContext(AuthContext);
    const { cart } = useContext(CartContext);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/?search=${searchTerm}`);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="w-full shadow bg-green-600">
            {/* TOP INFO BAR */}
            <div className="bg-green-700 text-white text-sm py-1 px-4 flex justify-end gap-4">
                {user ? (
                    <span>Xin chào, {user.username || user.name} ▼</span>
                ) : (
                    <span>Tài khoản của bạn ▼</span>
                )}
                <span>Giỏ hàng ({cart?.length || 0}) ♥</span>
                <span className="ml-4">☎ Hotline: 0938 424 289</span>
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
                    <button
                        className="bg-green-600 px-5 text-white flex items-center justify-center"
                    >
                        <FaSearch />
                    </button>
                </form>

                {/* ICONS */}
                <div className="flex items-center gap-4 text-white">
                    <Link to="/cart" className="relative text-2xl hover:text-green-200 transition-colors">
                        <FaShoppingCart />
                        {cart?.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </Link>
                    
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm hidden md:block">{user.username || user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-400 px-3 py-1 rounded transition-colors"
                                title="Đăng xuất"
                            >
                                <FaSignOutAlt />
                                <span className="hidden sm:block">Đăng xuất</span>
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-400 px-3 py-1 rounded transition-colors">
                            <FaUserCircle />
                            <span className="hidden sm:block">Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
