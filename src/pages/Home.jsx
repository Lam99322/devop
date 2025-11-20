// src/pages/HomeContentOnly.tsx (hoặc Home.jsx)
import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import formatCurrency from "../utils/formatCurrency";
import { Link, useLocation } from "react-router-dom";

// Component hiển thị thông tin sách (Card)
const BookItem = ({ book }) => {
    // Giả lập rating và reviews (Nếu dữ liệu từ backend chưa có)
    const rating = Math.floor(Math.random() * 2) + 4; // 4 hoặc 5 sao
    const reviews = Math.floor(Math.random() * 50) + 1;

    return (
        <Link
            to={`/books/${book.slug}`}
            className="relative bg-white border border-gray-200 rounded-lg shadow-sm p-3 block 
                       transition transform hover:shadow-md hover:-translate-y-0.5"
        >
            {/* Giả lập badge giảm giá 10% */}
            <span className="absolute top-0 left-0 bg-yellow-400 text-xs font-bold rounded-tl-lg rounded-br-lg px-2 py-1 z-10">
                10%
            </span>
            
            <img
                src={book.thumbnail}
                alt={book.title}
                className="h-40 w-full object-contain rounded mb-2" 
            />
            
            <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] mt-1">{book.title}</p>
            <p className="text-gray-500 text-xs line-clamp-1">Tác giả: {book.author || 'Đang cập nhật'}</p> 
            
            <p className="text-red-600 font-bold text-sm mt-1">{formatCurrency(book.price)}</p>
            
            {/* Rating và Reviews */}
            <div className="text-xs text-yellow-500 mt-1 flex items-center">
                 {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} 
                 <span className="text-gray-500 ml-1">({reviews} nhận xét)</span>
            </div>
        </Link>
    );
};

export default function HomeContentOnly() {
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
                    pageSize: 18, 
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
        // Wrapper chính cho nội dung (Thay thế cho div container mx-auto)
        <div className="flex-1 space-y-8 p-4 bg-gray-50 min-h-[80vh]"> 
            
            {/* 1. Banner & Sách Nổi Bật - Khu vực trên cùng của giao diện ảnh */}
            <div className="flex bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden min-h-64">
                
                {/* Khu vực Sách Nổi Bật (Kinh nghiệm thành công...) */}
                <div className="w-2/3 p-4 flex flex-col md:flex-row items-center justify-center space-x-4">
                    <img
                        src="/images/bannerr.jpg" 
                        alt="Kinh nghiệm thành công của ông chủ 48"
                        className="max-h-56 object-contain shadow-xl border border-gray-300"
                    />
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-800">KINH NGHIỆM THÀNH CÔNG CỦA ÔNG CHỦ 48</h3>
                        <p className="text-sm text-gray-600 mt-2 hidden sm:block">
                            Giải pháp toàn diện giúp bạn đạt được thành công trong kinh doanh và quản lý. 
                        </p>
                    </div>
                </div>

                {/* Hình ảnh trang trí (ly cà phê) */}
                <div className="w-1/3 bg-gray-100 hidden sm:flex items-center justify-center p-4">
                    
                </div>
            </div>

            {/* 2. Khu vực Sách Mới/Danh Sách Sản Phẩm */}
            <section className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-green-700">📖 Sách Mới</h2>
                    <Link to={`/books?pageNo=${pageNo}`} className="text-sm text-blue-600 hover:text-red-500 font-medium">
                        Xem tất cả »
                    </Link>
                </div>
                
                {loading ? (
                    // Skeleton Loading
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded-lg h-60 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Danh sách Sách */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {books.map((book) => (
                                <BookItem key={book.id} book={book} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pageInfo?.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: pageInfo?.totalPages || 1 }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPageNo(i)}
                                        className={`px-3 py-1 text-sm rounded-full border transition ${
                                            i === pageNo
                                                ? "bg-green-600 text-white font-bold border-green-700"
                                                : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-600 border-gray-300"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}