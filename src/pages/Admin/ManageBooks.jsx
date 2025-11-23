import { useState, useEffect, useContext } from "react";
import axiosClient from "../../api/axiosClient";
import { FaPlus, FaEdit, FaTrash, FaBook, FaSpinner, FaSearch, FaFilter, FaEye } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";
import BookForm from "./Books/BookForm";
import { AuthContext } from "../../context/AuthContext";
import cookieUtils from "../../utils/cookieUtils";

export default function ManageBooks() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Loading books from backend...");
      console.log("🔑 Checking auth token...");
      
      // Check auth token
      const token = document.cookie.split(';').find(c => c.trim().startsWith('authToken='));
      console.log("🔐 Has auth token:", !!token);
      
      // Use admin endpoint to get ALL books (requires ADMIN role)
      console.log(`🔍 Making request to /books...`);
      const res = await axiosClient.get("/books");
      console.log(`✅ API Response:`, {
        status: res.status,
        data: res.data,
        dataType: typeof res.data,
        dataKeys: res.data ? Object.keys(res.data) : null
      });
      console.log("📊 Response structure analysis:", {
        dataType: typeof res.data,
        isArray: Array.isArray(res.data),
        keys: res.data ? Object.keys(res.data) : 'null',
        dataDataExists: res.data?.data !== undefined,
        dataDataIsArray: Array.isArray(res.data?.data),
        fullResponse: res
      });
      
      // Handle Spring Boot response structure
      let booksData = [];
      
      if (res.data) {
        console.log("📊 Analyzing response structure...");
        
        // Check common Spring Boot patterns
        if (Array.isArray(res.data)) {
          console.log("📋 Direct array response");
          booksData = res.data;
        } else if (res.data.code !== undefined && res.data.data) {
          // Spring Boot response: {code: 1000, message: "success", data: [...]}
          console.log("📋 Spring Boot pattern: res.data.data");
          console.log("📊 Response code:", res.data.code);
          console.log("📊 Response message:", res.data.message);
          
          if (Array.isArray(res.data.data)) {
            booksData = res.data.data;
          } else if (res.data.data.content && Array.isArray(res.data.data.content)) {
            // Paginated response
            console.log("📋 Paginated response: res.data.data.content");
            booksData = res.data.data.content;
          } else if (res.data.data.items && Array.isArray(res.data.data.items)) {
            console.log("📋 Items response: res.data.data.items");
            booksData = res.data.data.items;
          }
        } else if (res.data.data && Array.isArray(res.data.data)) {
          console.log("📋 Generic .data array");
          booksData = res.data.data;
        } else if (res.data.content && Array.isArray(res.data.content)) {
          console.log("📋 Content array");
          booksData = res.data.content;
        } else {
          console.warn("⚠️ Unhandled response structure:", {
            type: typeof res.data,
            keys: Object.keys(res.data),
            sampleData: res.data
          });
          
          // Try to find any array in the response
          Object.keys(res.data).forEach(key => {
            if (Array.isArray(res.data[key])) {
              console.log(`📦 Found array at key '${key}'`);
              booksData = res.data[key];
            }
          });
        }
      }
      
      console.log("📦 Books loaded:", booksData.length);
      setBooks(booksData);
      
      if (booksData.length === 0) {
        setError("Chưa có sách nào trong hệ thống.");
      }
    } catch (err) {
      console.error("❌ Error loading books:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        url: err.config?.url
      });
      
      let errorMsg = "Không thể tải danh sách sách";
      if (err.response?.status === 401) {
        errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (err.response?.status === 403) {
        errorMsg = "Không có quyền truy cập. Cần quyền admin để xem danh sách sách.";
      } else if (err.response?.status === 404) {
        errorMsg = "API endpoint không tìm thấy. Backend có thể chưa sẵn sàng.";
      } else if (err.response?.data?.message) {
        errorMsg = `Backend error: ${err.response.data.message}`;
      } else {
        errorMsg = `Lỗi kết nối (${err.response?.status || 'Network'}): ${err.message}`;
      }
      
      setError(errorMsg);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 ManageBooks component mounted");
    
    // First verify we have admin access
    const verifyAccess = async () => {
      try {
        console.log("🔐 Testing admin access...");
        console.log("👤 Current user:", user);
        console.log("🎫 Auth token:", cookieUtils.getAuthToken() ? "Present" : "Missing");
        
        // Try a simple admin endpoint first
        const testRes = await axiosClient.get("/books");
        console.log("✅ Admin access verified, loading books...");
        loadBooks();
      } catch (err) {
        console.error("❌ Admin access test failed:", err);
        if (err.response?.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại với tài khoản admin.");
        } else if (err.response?.status === 403) {
          setError("Không có quyền admin. Vui lòng đăng nhập với tài khoản có quyền admin.");
        } else {
          setError(`Không thể kết nối tới server (${err.response?.status}). Vui lòng kiểm tra backend.`);
        }
        setLoading(false);
      }
    };
    
    verifyAccess();
  }, []);

  const deleteBook = async (id) => {
    const booksArray = Array.isArray(books) ? books : [];
    const book = booksArray.find(b => b.id === id);
    if (!confirm(`Bạn có chắc muốn xóa sách "${book?.title}"?\n\nHành động này không thể hoàn tác!`)) return;
    
    try {
      setDeleting(id);
      console.log(`🗑️ Deleting book ID: ${id}`);
      
      await axiosClient.delete(`/books/${id}`);
      console.log(`✅ Book deleted successfully`);
      
      // Remove from local state
      setBooks(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter(b => b.id !== id);
      });
      
      alert(`Đã xóa sách "${book?.title}" thành công!`);
    } catch (err) {
      console.error("❌ Delete book error:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        bookId: id
      });
      
      const errorMsg = err.response?.data?.message || 
                      `Xóa sách thất bại (${err.response?.status || 'Network Error'})! Vui lòng thử lại.`;
      alert(errorMsg);
    } finally {
      setDeleting(null);
    }
  };

  // Ensure books is always an array before filtering
  const booksArray = Array.isArray(books) ? books : [];
  const filteredBooks = booksArray.filter(book => {
    const categoryText = typeof book.category === 'object' ? book.category?.name : book.category;
    return (
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryText?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaBook className="text-blue-600" />
              Quản lý Sách
            </h1>
            <p className="text-gray-600">Thêm, sửa, xóa sách trong hệ thống</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            Thêm Sách Mới
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
            <button
              onClick={() => {
                console.log("🎭 Loading mock data for testing...");
                setBooks([
                  {
                    id: 1,
                    title: "Đắc Nhân Tâm",
                    author: "Dale Carnegie",
                    price: 89000,
                    category: "Kỹ năng sống",
                    stock: 25,
                    description: "Cuốn sách kinh điển về kỹ năng giao tiếp"
                  },
                  {
                    id: 2,
                    title: "Sapiens",
                    author: "Yuval Noah Harari",
                    price: 125000,
                    category: "Lịch sử",
                    stock: 15,
                    description: "Lược sử loài người"
                  },
                  {
                    id: 3,
                    title: "Clean Code",
                    author: "Robert C. Martin",
                    price: 180000,
                    category: "Công nghệ",
                    stock: 8,
                    description: "Cẩm nang viết code sạch"
                  },
                  {
                    id: 4,
                    title: "Atomic Habits",
                    author: "James Clear",
                    price: 120000,
                    category: "Kỹ năng sống",
                    stock: 12,
                    description: "Thay đổi tí hon hiệu quả bất ngờ"
                  }
                ]);
                setError(null);
              }}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Dùng dữ liệu mẫu để test
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sách (tên, tác giả, thể loại)..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaFilter />
              Lọc
            </button>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-semibold text-gray-800">
              Danh sách Sách ({filteredBooks.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {searchTerm ? "Không tìm thấy sách nào." : "Chưa có sách nào."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Ảnh</th>
                    <th className="text-left p-4 font-medium text-gray-700">Thông tin sách</th>
                    <th className="text-left p-4 font-medium text-gray-700">Thể loại</th>
                    <th className="text-left p-4 font-medium text-gray-700">Giá</th>
                    <th className="text-left p-4 font-medium text-gray-700">Tồn kho</th>
                    <th className="text-left p-4 font-medium text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map(book => (
                    <tr key={book.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded shadow-sm flex flex-col items-center justify-center text-xs text-blue-700 border">
                          <div className="text-lg">📖</div>
                          <div className="text-center leading-tight mt-1">
                            {book.title.split(' ').slice(0, 2).join(' ').substring(0, 8)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <h4 className="font-medium text-gray-800">{book.title}</h4>
                        <p className="text-sm text-gray-600">Tác giả: {book.author}</p>
                        {book.isbn && <p className="text-sm text-gray-500 font-mono">ISBN: {book.isbn}</p>}
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {typeof book.category === 'object' ? book.category?.name || 'Chưa phân loại' : book.category || 'Chưa phân loại'}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-blue-600">
                        {formatCurrency(book.price)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          book.stock > 10 ? 'bg-green-100 text-green-800' :
                          book.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {book.stock} cuốn
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const categoryText = typeof book.category === 'object' ? book.category?.name : book.category;
                              alert(`Chi tiết sách:\nID: ${book.id}\nTiêu đề: ${book.title}\nTác giả: ${book.author}\nThể loại: ${categoryText || 'N/A'}\nGiá: ${formatCurrency(book.price)}\nTồn kho: ${book.stock || 0} cuốn\nMô tả: ${book.description || 'Không có mô tả'}`);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                          >
                            <FaEye />
                            Xem
                          </button>
                          <button
                            onClick={() => setEditingBook(book)}
                            disabled={deleting === book.id}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors disabled:opacity-50"
                          >
                            <FaEdit />
                            Sửa
                          </button>
                          <button
                            onClick={() => deleteBook(book.id)}
                            disabled={deleting === book.id}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors disabled:opacity-50"
                          >
                            {deleting === book.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                            {deleting === book.id ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Book Form */}
        {showForm && (
          <BookForm
            onSaved={() => {
              setShowForm(false);
              loadBooks();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
        
        {editingBook && (
          <BookForm
            book={editingBook}
            onSaved={() => {
              setEditingBook(null);
              loadBooks();
            }}
            onCancel={() => setEditingBook(null)}
          />
        )}
    </div>
  );
}
