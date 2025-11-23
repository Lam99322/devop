import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { FaSave, FaTimes, FaSpinner, FaBook, FaImage } from "react-icons/fa";
import { getBookImageUrl, handleImageError } from "../../../utils/imageUtils";

export default function BookForm({ book = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    description: "",
    category: "",
    publisher: "",
    isbn: "",
    pages: "",
    publicationYear: "",
    stock: "",
    image: "",
    status: "ACTIVE"
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Load categories for dropdown
    loadCategories();
    
    if (book) {
      setForm({
        title: book.title || "",
        author: book.author || "",
        price: book.price?.toString() || "",
        description: book.description || "",
        category: typeof book.category === 'object' ? book.category?.name || "" : book.category || "",
        publisher: book.publisher || "",
        isbn: book.isbn || "",
        pages: book.pages?.toString() || "",
        publicationYear: book.publicationYear?.toString() || "",
        stock: book.stock?.toString() || "",
        image: book.image || "",
        status: book.status || "ACTIVE"
      });
    }
    setErrors({});
  }, [book]);

  const loadCategories = async () => {
    try {
      const res = await axiosClient.get("/categories/list");
      const catsData = res.data?.data || res.data || [];
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      // Mock fallback
      setCategories([
        { id: 1, name: "Văn học" },
        { id: 2, name: "Khoa học" },
        { id: 3, name: "Thiếu nhi" },
        { id: 4, name: "Kỹ năng sống" },
        { id: 5, name: "Lịch sử" }
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = "Tiêu đề là bắt buộc";
    if (!form.author.trim()) newErrors.author = "Tác giả là bắt buộc";
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) {
      newErrors.price = "Giá phải là số dương";
    }
    if (!form.category.trim()) newErrors.category = "Danh mục là bắt buộc";
    if (form.stock && (isNaN(form.stock) || parseInt(form.stock) < 0)) {
      newErrors.stock = "Số lượng phải là số không âm";
    }
    if (form.pages && (isNaN(form.pages) || parseInt(form.pages) <= 0)) {
      newErrors.pages = "Số trang phải là số dương";
    }
    if (form.publicationYear && (isNaN(form.publicationYear) || parseInt(form.publicationYear) < 1000)) {
      newErrors.publicationYear = "Năm xuất bản không hợp lệ";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    try {
      const bookData = {
        ...form,
        price: parseFloat(form.price),
        stock: form.stock ? parseInt(form.stock) : 0,
        pages: form.pages ? parseInt(form.pages) : null,
        publicationYear: form.publicationYear ? parseInt(form.publicationYear) : null
      };

      console.log("📚 Saving book:", bookData);
      
      if (book) {
        console.log(`📝 Updating book ID: ${book.id}`);
        const res = await axiosClient.put(`/books/${book.id}`, bookData);
        console.log("✅ Update response:", res.data);
        alert("Cập nhật sách thành công!");
      } else {
        console.log("➕ Creating new book");
        const res = await axiosClient.post("/books", bookData); // Changed from /books/add to /books
        console.log("✅ Create response:", res.data);
        alert("Thêm sách mới thành công!");
      }
      
      onSaved && onSaved();
      if (!book) {
        // Reset form for new book
        setForm({
          title: "",
          author: "",
          price: "",
          description: "",
          category: "",
          publisher: "",
          isbn: "",
          pages: "",
          publicationYear: "",
          stock: "",
          image: "",
          status: "ACTIVE"
        });
      }
    } catch (err) {
      console.error("❌ Save book error:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        data: err.response?.data
      });
      
      let errorMsg = "Lỗi khi lưu sách";
      if (err.response?.status === 400) {
        errorMsg = err.response?.data?.message || "Dữ liệu không hợp lệ";
      } else if (err.response?.status === 409) {
        errorMsg = "Sách với tiêu đề này đã tồn tại";
      } else if (err.response?.status === 401) {
        errorMsg = "Phiên đăng nhập hết hạn";
      } else if (err.response?.status === 403) {
        errorMsg = "Không có quyền thực hiện thao tác này";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaBook className="text-blue-600" />
          {book ? "Sửa Sách" : "Thêm Sách Mới"}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Author Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tiêu đề sách"
              disabled={saving}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tác giả *
            </label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.author ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên tác giả"
              disabled={saving}
            />
            {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author}</p>}
          </div>
        </div>

        {/* Price & Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá *
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="1000"
              disabled={saving}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={saving}
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>
        </div>

        {/* Publisher & Stock Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhà xuất bản
            </label>
            <input
              type="text"
              name="publisher"
              value={form.publisher}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nhà xuất bản"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng tồn kho
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              disabled={saving}
            />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
          </div>
        </div>

        {/* ISBN & Pages & Year Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ISBN
            </label>
            <input
              type="text"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="978-xxx-xxx-xxx-x"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số trang
            </label>
            <input
              type="number"
              name="pages"
              value={form.pages}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.pages ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="1"
              disabled={saving}
            />
            {errors.pages && <p className="text-red-500 text-xs mt-1">{errors.pages}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Năm xuất bản
            </label>
            <input
              type="number"
              name="publicationYear"
              value={form.publicationYear}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.publicationYear ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2024"
              min="1000"
              max={new Date().getFullYear()}
              disabled={saving}
            />
            {errors.publicationYear && <p className="text-red-500 text-xs mt-1">{errors.publicationYear}</p>}
          </div>
        </div>

        {/* Image URL & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Ảnh
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/book-cover.jpg"
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({ ...prev, image: "placeholder" }));
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={saving}
                title="Sử dụng ảnh mặc định"
              >
                <FaImage />
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Nhập URL ảnh bìa sách hoặc click biểu tượng để tạo placeholder
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview
            </label>
            <div className="flex justify-center">
              {form.image || (book && (book.thumbnail || book.bookThumbnail)) ? (
                <img
                  src={form.image || getBookImageUrl(book)}
                  alt="Preview"
                  className="w-20 h-28 object-cover rounded shadow-md border"
                  onError={(e) => handleImageError(e, form.title || "Preview")}
                />
              ) : (
                <div className="w-20 h-28 bg-gradient-to-br from-green-100 to-green-200 rounded shadow-md border flex flex-col items-center justify-center text-green-700">
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-xs text-center leading-tight px-1">
                    {(form.title || "Preview").substring(0, 12)}
                  </div>
                </div>
              )}
            </div>
            {form.image && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                {form.image.startsWith('data:') ? 'Placeholder' : 'External URL'}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả về sách..."
            disabled={saving}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          >
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? "Đang lưu..." : "Lưu sách"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}