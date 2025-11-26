import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import formatCurrency from "../utils/formatCurrency";
import { Link, useLocation } from "react-router-dom";
import { getBookImageUrl, handleImageError } from "../utils/imageUtils";

// Component hiển thị thông tin sách
const BookItem = ({ book }) => {
    return (
        <Link
            to={`/books/${book.slug}`}
            className="relative bg-white border border-gray-200 rounded-lg shadow-sm p-3 block 
                       transition transform hover:shadow-md hover:-translate-y-0.5"
        >
            <img
                src={getBookImageUrl(book)}
                alt={book.title}
                className="h-40 w-full object-cover rounded mb-2"
                data-book-id={book.id}
                onError={(e) => handleImageError(e, book.title)}
            />
            
            <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] mt-1">{book.title}</p>
            <p className="text-gray-500 text-xs line-clamp-1">Tác giả: {book.author || 'Đang cập nhật'}</p> 
            <p className="text-red-600 font-bold text-sm mt-1">{formatCurrency(book.price)}</p>
        </Link>
    );
};

export default function Home() {
    const [books, setBooks] = useState([]);
    const [pageInfo, setPageInfo] = useState({ totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [pageNo, setPageNo] = useState(0);

    const location = useLocation();
    const search = new URLSearchParams(location.search).get("search") || "";

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/books/list", {
                params: { 
                    pageNo, 
                    pageSize: 12, 
                    sortBy: "createdAt:desc", 
                    search,
                },
            });
            setBooks(res?.data?.data?.items || []);
            setPageInfo(res?.data?.data || { totalPages: 1 });
        } catch {
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [pageNo, search]);

    return (
        <div className="flex-1 space-y-6 p-4 bg-gray-50 min-h-screen"> 
            
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">📚 Chào mừng đến với Nhà sách Online</h1>
                    <p className="text-lg mb-6">Khám phá hàng nghìn cuốn sách hay từ các tác giả nổi tiếng</p>
                    <Link 
                        to="/books" 
                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Khám phá ngay
                    </Link>
                </div>
            </div>

            {/* Sách mới nhất */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">📚 Sách mới nhất</h2>
                    <Link 
                        to="/books" 
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                        Xem tất cả →
                    </Link>
                </div>
                
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {books.slice(0, 12).map((book) => (
                            <BookItem key={book.id} book={book} />
                        ))}
                    </div>
                )}
            </section>

            {/* Danh mục phổ biến */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🏷️ Danh mục phổ biến</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { id: 1, icon: "💼", name: "Kinh tế - Quản lý", color: "blue" },
                        { id: 2, icon: "📚", name: "Văn học", color: "purple" },
                        { id: 3, icon: "🎯", name: "Kỹ năng sống", color: "green" },
                        { id: 4, icon: "💻", name: "Công nghệ", color: "orange" },
                        { id: 5, icon: "🎓", name: "Giáo dục", color: "red" },
                        { id: 6, icon: "🏃", name: "Sức khỏe", color: "teal" },
                    ].map(category => (
                        <Link 
                            key={category.id}
                            to={`/books?categoryId=${category.id}`} 
                            className={`group bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                                       hover:from-${category.color}-100 hover:to-${category.color}-200 
                                       p-4 rounded-lg border border-${category.color}-200 
                                       transition-all duration-300 hover:shadow-md`}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                                    {category.icon}
                                </div>
                                <h3 className={`font-medium text-${category.color}-900 text-sm`}>
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}