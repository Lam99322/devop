import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaArrowLeft, FaHeart } from "react-icons/fa";
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
  
  const { addToCart, cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  // Generate random rating and reviews like in Home page
  const [rating] = useState(() => Math.floor(Math.random() * 2) + 4); // 4 or 5 stars
  const [reviews] = useState(() => Math.floor(Math.random() * 100) + 50); // 50-150 reviews

  const fetchBook = async () => {
    try {
      const res = await axiosClient.get(`/books/slug/${slug}`);
      setBook(res.data?.data || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBooks = async () => {
    try {
      const res = await axiosClient.get("/books/list", {
        params: { 
          pageNo: 0, 
          pageSize: 6, 
          sortBy: "createdAt:desc"
        },
      });
      setRelatedBooks(res?.data?.data?.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBook();
    fetchRelatedBooks();
  }, [slug]);

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(book);
    }
    
    // Show success message or feedback here if needed
    alert(`Đã thêm ${quantity} cuốn "${book.title}" vào giỏ hàng!`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sách...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex-1 bg-gray-50 min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sách</h2>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaArrowLeft /> Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-[80vh] p-4 space-y-6">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-green-600">Trang chủ</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{book.title}</span>
      </div>

      {/* Main Book Detail */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          
          {/* Book Image */}
          <div className="relative">
            <div className="sticky top-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold rounded px-2 py-1 z-10">
                  10% OFF
                </span>
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="w-full h-96 object-contain rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-gray-600 text-lg">Tác giả: {book.author || 'Đang cập nhật'}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(rating)}
              </div>
              <span className="text-gray-600">({reviews} đánh giá)</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-red-600">
                  {formatCurrency(book.price * 0.9)} {/* 10% discount */}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(book.price)}
                </span>
              </div>
              <p className="text-green-600 font-medium">Tiết kiệm: {formatCurrency(book.price * 0.1)}</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-700 leading-relaxed">
                {book.description || 'Đang cập nhật mô tả cho cuốn sách này. Vui lòng quay lại sau để xem thông tin chi tiết.'}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Số lượng:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  Thêm vào giỏ hàng
                </button>
                
                <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FaHeart className="text-gray-600 hover:text-red-500" />
                </button>
              </div>

              {!user && (
                <p className="text-sm text-gray-600">
                  <Link to="/login" className="text-green-600 hover:underline">Đăng nhập</Link> để thêm sách vào giỏ hàng
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Books */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sách liên quan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {relatedBooks.slice(0, 6).map((relatedBook) => {
            const relatedRating = Math.floor(Math.random() * 2) + 4;
            const relatedReviews = Math.floor(Math.random() * 50) + 1;
            
            return (
              <Link
                key={relatedBook.id}
                to={`/books/${relatedBook.slug}`}
                className="relative bg-white border border-gray-200 rounded-lg shadow-sm p-3 block transition transform hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="absolute top-0 left-0 bg-yellow-400 text-xs font-bold rounded-tl-lg rounded-br-lg px-2 py-1 z-10">
                  10%
                </span>
                
                <img
                  src={relatedBook.thumbnail}
                  alt={relatedBook.title}
                  className="h-32 w-full object-contain rounded mb-2" 
                />
                
                <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{relatedBook.title}</p>
                <p className="text-red-600 font-bold text-sm mt-1">{formatCurrency(relatedBook.price)}</p>
                
                <div className="text-xs text-yellow-500 mt-1 flex items-center">
                   {'★'.repeat(relatedRating)}{'☆'.repeat(5 - relatedRating)} 
                   <span className="text-gray-500 ml-1">({relatedReviews})</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
