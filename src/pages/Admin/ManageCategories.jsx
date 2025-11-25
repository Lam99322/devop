import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { FaFolder, FaSpinner, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import API_ENDPOINTS from "../../constants/apiEndpoints";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading categories from backend...');
      
      // Use public endpoint for listing categories: GET /categories/list
      const res = await axiosClient.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
      console.log('✅ Categories loaded successfully:', res.data);
      
      // Handle ApiResponse structure
      let categoriesData = [];
      if (res.data?.data && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      }
      
      setCategories(categoriesData);
      console.log(`📂 Loaded ${categoriesData.length} categories`);
      
    } catch (err) {
      console.error('❌ Failed to load categories:', err);
      setError(`Không thể tải danh sách danh mục: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      console.log('📂 Creating new category:', categoryData);
      
      // Use exact backend endpoint: POST /categories/add (ADMIN: Create category)
      const response = await axiosClient.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData);
      
      console.log('✅ Category created successfully:', response.data);
      alert('Tạo danh mục thành công!');
      setShowForm(false);
      loadCategories(); // Reload categories
      
    } catch (error) {
      console.error('❌ Failed to create category:', error);
      alert(`Không thể tạo danh mục: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      console.log(`📝 Updating category ${categoryId}:`, categoryData);
      
      // Use exact backend endpoint: PUT /categories/{categoryId} (ADMIN: Update category by id)
      const response = await axiosClient.put(API_ENDPOINTS.CATEGORIES.UPDATE(categoryId), categoryData);
      
      console.log('✅ Category updated successfully:', response.data);
      alert('Cập nhật danh mục thành công!');
      setEditingCategory(null);
      setShowForm(false);
      loadCategories(); // Reload categories
      
    } catch (error) {
      console.error('❌ Failed to update category:', error);
      alert(`Không thể cập nhật danh mục: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.')) return;
    
    try {
      console.log(`🗑️ Deleting category ${categoryId}...`);
      
      // Use exact backend endpoint: DELETE /categories/{categoryId} (ADMIN: Delete category by id)
      await axiosClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(categoryId));
      
      console.log('✅ Category deleted successfully');
      alert('Xóa danh mục thành công!');
      loadCategories(); // Reload categories
      
    } catch (error) {
      console.error('❌ Failed to delete category:', error);
      alert(`Không thể xóa danh mục: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (showForm) {
    return <CategoryForm 
      category={editingCategory}
      onSubmit={editingCategory ? 
        (data) => handleUpdateCategory(editingCategory.id, data) : 
        handleCreateCategory
      }
      onCancel={() => {
        setShowForm(false);
        setEditingCategory(null);
      }}
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFolder className="text-blue-600" />
            Quản lý Danh mục
          </h1>
          <span className="text-gray-600">({categories.length} danh mục)</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaPlus />
            Thêm danh mục
          </button>
          <button
            onClick={loadCategories}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <FaSpinner className={loading ? 'animate-spin' : ''} />
            Tải lại
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="p-8 text-center">
          <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg">
          <FaFolder className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có danh mục nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const categoryInfo = `Thông tin danh mục:\n\nID: ${category.id}\nTên: ${category.name}\nSlug: ${category.slug}\nMô tả: ${category.description || 'Không có'}\nNgày tạo: ${category.createdAt ? new Date(category.createdAt).toLocaleString('vi-VN') : 'N/A'}`;
                      alert(categoryInfo);
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setShowForm(true);
                    }}
                    className="p-2 text-green-500 hover:bg-green-50 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              )}
              
              <div className="text-xs text-gray-400">
                <p>ID: {category.id}</p>
                {category.createdAt && (
                  <p>Tạo: {new Date(category.createdAt).toLocaleDateString('vi-VN')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple Category Form Component
function CategoryForm({ category, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Tên danh mục không được để trống!');
      return;
    }
    
    onSubmit(formData);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">
          {category ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: formData.slug || generateSlug(name)
                });
              }}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên danh mục"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="URL slug (tự động tạo từ tên)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả danh mục (tùy chọn)"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              {category ? 'Cập nhật' : 'Tạo danh mục'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}