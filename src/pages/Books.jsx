import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import API_ENDPOINTS from "../constants/apiEndpoints";
import BookCard from "../components/BookCard/BookCard";
import { FaSearch, FaFilter, FaSort, FaSpinner, FaBook, FaChevronDown } from "react-icons/fa";

function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, totalElements: 0 });
  const [showFilters, setShowFilters] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get URL params
  const searchParams = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt:desc',
    pageNo: parseInt(searchParams.get('pageNo')) || 0,
    pageSize: 12
  });

  // Update URL when filters change
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && key !== 'pageSize') {
        params.set(key, value);
      }
    });
    navigate(`/books?${params.toString()}`, { replace: true });
  };

  // Load categories
  const loadCategories = async () => {
    try {
      console.log('📂 Loading categories...');
      const endpoints = [
        '/categories',
        '/categories/list',
        '/public/categories'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axiosClient.get(endpoint);
          let categoriesData = [];
          
          if (response.data?.data?.content) {
            categoriesData = response.data.data.content;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            categoriesData = response.data.data;
          } else if (Array.isArray(response.data)) {
            categoriesData = response.data;
          }
          
          console.log(`✅ Loaded ${categoriesData.length} categories from ${endpoint}`);
          setCategories(categoriesData);
          return;
        } catch (err) {
          console.warn(`❌ Failed to load categories from ${endpoint}:`, err.message);
          continue;
        }
      }
      
      // Fallback mock categories
      console.log('🎭 Using mock categories');
      setCategories([
        { id: 1, name: 'Kinh tế - Quản lý' },
        { id: 2, name: 'Văn học - Tiểu thuyết' },
        { id: 3, name: 'Kỹ năng sống' },
        { id: 4, name: 'Công nghệ thông tin' },
        { id: 5, name: 'Giáo dục - Tham khảo' },
        { id: 6, name: 'Sức khỏe - Thể thao' }
      ]);
    } catch (err) {
      console.error('❌ Error loading categories:', err);
    }
  };

  // Load books with filters
  const loadBooks = async () => {
    setLoading(true);
    try {
      console.log('📚 Loading books with filters:', filters);
      
      const params = {
        pageNo: filters.pageNo,
        pageSize: filters.pageSize,
        sortBy: filters.sortBy
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      
      // Try multiple endpoints
      const endpoints = [
        API_ENDPOINTS.BOOKS.GET_ALL_PUBLIC,
        '/books/list',
        '/books/public',
        '/books'
      ];
      
      let booksData = [];
      let pageData = { totalPages: 1, totalElements: 0 };
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying books endpoint: ${endpoint}`);
          const response = await axiosClient.get(endpoint, { params });
          
          if (response.data?.data?.content) {
            booksData = response.data.data.content;
            pageData = {
              totalPages: response.data.data.totalPages || 1,
              totalElements: response.data.data.totalElements || booksData.length
            };
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            booksData = response.data.data;
          } else if (Array.isArray(response.data)) {
            booksData = response.data;
          }
          
          console.log(`✅ Loaded ${booksData.length} books from ${endpoint}`);
          break;
        } catch (err) {
          console.warn(`❌ Failed to load books from ${endpoint}:`, err.message);
          continue;
        }
      }
      
      // Filter by category if specified (client-side fallback)
      if (filters.categoryId && booksData.length > 0) {
        booksData = booksData.filter(book => 
          book.categoryId?.toString() === filters.categoryId.toString() ||
          book.category?.id?.toString() === filters.categoryId.toString()
        );
        console.log(`📋 Filtered to ${booksData.length} books for category ${filters.categoryId}`);
      }
      
      // Search filter (client-side fallback)
      if (filters.search && booksData.length > 0) {
        const searchTerm = filters.search.toLowerCase();
        booksData = booksData.filter(book =>
          book.title?.toLowerCase().includes(searchTerm) ||
          book.author?.toLowerCase().includes(searchTerm) ||
          book.description?.toLowerCase().includes(searchTerm)
        );
        console.log(`🔍 Search filtered to ${booksData.length} books`);
      }
      
      // Sort books (client-side fallback)
      if (filters.sortBy) {
        const [field, direction] = filters.sortBy.split(':');
        booksData.sort((a, b) => {
          let aVal, bVal;
          
          switch (field) {
            case 'price':
              aVal = a.price || 0;
              bVal = b.price || 0;
              break;
            case 'title':
              aVal = a.title || '';
              bVal = b.title || '';
              break;
            case 'createdAt':
            default:
              aVal = new Date(a.createdAt || 0);
              bVal = new Date(b.createdAt || 0);
              break;
          }
          
          if (direction === 'desc') {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          } else {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          }
        });
      }
      
      setBooks(booksData);
      setPageInfo(pageData);
      
    } catch (err) {
      console.error('❌ Error loading books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and filter changes
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, pageNo: 0 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Handle page change
  const handlePageChange = (pageNo) => {
    const newFilters = { ...filters, pageNo };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Get selected category name
  const selectedCategory = categories.find(cat => cat.id?.toString() === filters.categoryId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaBook className="text-3xl text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cửa hàng Sách</h1>
                <p className="text-gray-600">Khám phá hàng nghìn cuốn sách hấp dẫn</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{pageInfo.totalElements}</p>
              <p className="text-sm text-gray-500">cuốn sách</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Search */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sách theo tên, tác giả..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaFilter />
                Bộ lọc
                <FaChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="createdAt:desc">Mới nhất</option>
                    <option value="createdAt:asc">Cũ nhất</option>
                    <option value="price:asc">Giá thấp đến cao</option>
                    <option value="price:desc">Giá cao đến thấp</option>
                    <option value="title:asc">Tên A-Z</option>
                    <option value="title:desc">Tên Z-A</option>
                  </select>
                </div>

                {/* Page Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hiện thị</label>
                  <select
                    value={filters.pageSize}
                    onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={8}>8 sách</option>
                    <option value={12}>12 sách</option>
                    <option value={20}>20 sách</option>
                    <option value={40}>40 sách</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {(filters.categoryId || filters.search) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Danh mục: {selectedCategory.name}
                  <button 
                    onClick={() => handleFilterChange('categoryId', '')}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Tìm kiếm: "{filters.search}"
                  <button 
                    onClick={() => handleFilterChange('search', '')}
                    className="hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải sách...</p>
            </div>
          </div>
        ) : books.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {pageInfo.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(Math.max(0, filters.pageNo - 1))}
                  disabled={filters.pageNo === 0}
                  className="px-3 py-2 text-sm rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Trước
                </button>
                
                {Array.from({ length: Math.min(pageInfo.totalPages, 5) }, (_, i) => {
                  const pageNum = Math.max(0, Math.min(pageInfo.totalPages - 5, filters.pageNo - 2)) + i;
                  if (pageNum >= pageInfo.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg border transition ${
                        pageNum === filters.pageNo
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-100 border-gray-300"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(Math.min(pageInfo.totalPages - 1, filters.pageNo + 1))}
                  disabled={filters.pageNo >= pageInfo.totalPages - 1}
                  className="px-3 py-2 text-sm rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Tiếp
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy sách nào
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.categoryId 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Hiện tại chưa có sách nào trong hệ thống'
              }
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaBook />
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Books;
