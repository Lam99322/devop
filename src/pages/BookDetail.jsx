import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaArrowLeft,
  FaHeart,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import axiosClient from "../api/axiosClient";
import formatCurrency from "../utils/formatCurrency";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

export default function BookDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedBooks, setRelatedBooks] = useState([]);

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  // Fake data rating
  const [rating] = useState(() => Math.floor(Math.random() * 2) + 4);
  const [reviews] = useState(() => Math.floor(Math.random() * 150) + 20);

  const fetchBook = async () => {
    try {
      const res = await axiosClient.get(`/books/slug/${slug}`);
      setBook(res.data?.data || res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBooks = async () => {
    try {
      const res = await axiosClient.get("/books/list", {
        params: { pageNo: 0, pageSize: 6, sortBy: "createdAt:desc" },
      });
      setRelatedBooks(res?.data?.data?.items || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBook();
    fetchRelatedBooks();
  }, [slug]);

  // ✔ FIX ADD TO CART — truyền đúng cấu trúc
  const handleAddToCart = () => {
    if (!user) return navigate("/login");

    const item = {
      id: book.id,
      title: book.title,
      price: book.price,
      image: book.thumbnail,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }

    alert(`Đã thêm ${quantity} cuốn "${book.title}" vào giỏ hàng!`);
  };

  // Render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;

    for (let i = 0; i < full; i++) stars.push(<FaStar key={i} className="text-yellow-400" />);
    if (half) stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    for (let i = stars.length; i < 5; i++)
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);

    return stars;
  };

  if (loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-green-600 rounded-full mx-auto mb-4"></div>
          <p>Đang tải thông tin sách...</p>
        </div>
      </div>
    );

  if (!book)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Không tìm thấy sách</h2>
          <Link
            to="/"
            className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 w-fit mx-auto"
          >
            <FaArrowLeft /> Về trang chủ
          </Link>
        </div>
      </div>
    );

  return (
    <div className="p-4 space-y-6">
      
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <Link to="/" className="hover:text-green-600">Trang chủ</Link>
        <span>›</span>
        <span className="font-medium text-gray-900">{book.title}</span>
      </div>

      {/* Book detail card */}
      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Image */}
        <div>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow">
            <span className="absolute top-2 left-2 px-3 py-1 text-xs font-bold bg-yellow-400 rounded">
              SALE 10%
            </span>
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-full h-96 object-contain"
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">

          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-gray-700 text-lg">Tác giả: {book.author || "Đang cập nhật"}</p>

          {/* Stars */}
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(rating)}</div>
            <span className="text-gray-600">({reviews} đánh giá)</span>
          </div>

          {/* Price */}
          <div>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(book.price * 0.9)}
            </p>
            <p className="line-through text-gray-400">{formatCurrency(book.price)}</p>
            <p className="text-green-600 font-medium">
              Tiết kiệm {formatCurrency(book.price * 0.1)}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-1">Mô tả sản phẩm</h3>
            <p className="text-gray-700">
              {book.description || "Chưa có mô tả."}
            </p>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="font-medium">Số lượng:</span>
            <div className="flex border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <FaShoppingCart />
              Thêm vào giỏ hàng
            </button>

            <button className="p-3 border rounded-lg hover:bg-gray-100">
              <FaHeart className="text-gray-600 hover:text-red-500" />
            </button>
          </div>

          {/* Admin buttons */}
          {user?.role === "ADMIN" && (
            <div className="flex gap-3 mt-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                <FaEdit /> Sửa sách
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2">
                <FaTrash /> Xoá sách
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Related books */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Sách liên quan</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {relatedBooks.slice(0, 6).map((b) => (
            <Link
              key={b.id}
              to={`/books/${b.slug}`}
              className="border rounded-lg p-3 hover:shadow-md transition"
            >
              <img
                src={b.thumbnail}
                className="h-32 w-full object-contain mb-2"
              />
              <p className="font-semibold text-sm line-clamp-2">{b.title}</p>
              <p className="text-red-600 font-bold text-sm">
                {formatCurrency(b.price)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
