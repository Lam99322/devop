import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import formatCurrency from "../utils/formatCurrency";

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    try {
      const res = await axiosClient.get(`/books/slug/${slug}`);
      setBook(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [slug]);

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (!book) return <p className="text-center mt-10">Không tìm thấy sách</p>;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-full h-96 object-cover rounded-xl shadow"
        />

        <div>
          <h1 className="text-3xl font-bold mb-3">{book.title}</h1>
          <p className="text-gray-500 mb-2">Tác giả: {book.author}</p>

          <p className="text-red-600 text-3xl font-bold mb-4">
            {formatCurrency(book.price)}
          </p>

          <p className="text-gray-700 leading-7 mb-4">{book.description}</p>

          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}
