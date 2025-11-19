import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaUserCircle } from "react-icons/fa";

export default function Header() {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/?search=${searchTerm}`);
    };

    return (
        <header className="w-full shadow bg-green-600">
            {/* TOP INFO BAR */}
            <div className="bg-green-700 text-white text-sm py-1 px-4 flex justify-end gap-4">
                <span>Tài khoản của bạn ▼</span>
                <span>Giỏ hàng (0) ♥</span>
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
                <div className="flex items-center gap-6 text-white">
                    <Link to="/cart" className="relative text-2xl">
                        <FaShoppingCart />
                    </Link>
                    <Link to="/bookstore/auth/login" className="text-2xl">
                        <FaUserCircle />
                    </Link>
                </div>
            </div>
        </header>
    );
}
