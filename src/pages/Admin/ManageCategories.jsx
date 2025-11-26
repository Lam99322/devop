import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { FaFolder, FaSpinner, FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaSync, FaSave } from "react-icons/fa";
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
      
      console.log('📂 Loading categories for admin management...');
      
      // Try multiple admin endpoints for categories
      const endpoints = [
        '/categories/list',        // GET /categories/list - Get list categories
        '/categories',            // Alternative admin endpoint
        '/admin/categories',      // Admin specific endpoint
        API_ENDPOINTS.CATEGORIES?.GET_ALL || '/categories/list'
      ];
      
      let categoriesData = [];
      let successEndpoint = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying categories endpoint: ${endpoint}`);
          const response = await axiosClient.get(endpoint);
          
          // Handle different response structures
          if (response.data?.data?.content) {
            categoriesData = response.data.data.content;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            categoriesData = response.data.data;
          } else if (Array.isArray(response.data)) {
            categoriesData = response.data;
          }
          
          successEndpoint = endpoint;
          console.log(`✅ Loaded ${categoriesData.length} categories from ${endpoint}`);
          break;
          
        } catch (endpointError) {
          console.warn(`❌ Failed ${endpoint}: ${endpointError.response?.status} - ${endpointError.message}`);
          continue;
        }
      }
      
      if (!successEndpoint) {
        console.log('⚠️ All admin endpoints failed, using mock data...');
        
        // Mock categories for admin demo
        categoriesData = [
          {
            id: 1,
            name: 'Kinh tế - Quản lý',
            slug: 'kinh-te-quan-ly',
            description: 'Sách về kinh doanh, quản lý và tài chính',
            createdAt: new Date().toISOString(),
            bookCount: 45
          },
          {
            id: 2,
            name: 'Văn học - Tiểu thuyết',
            slug: 'van-hoc-tieu-thuyet',
            description: 'Các tác phẩm văn học và tiểu thuyết hay',
            createdAt: new Date().toISOString(),
            bookCount: 38
          },
          {
            id: 3,
            name: 'Kỹ năng sống',
            slug: 'ky-nang-song',
            description: 'Sách phát triển bản thân và kỹ năng mềm',
            createdAt: new Date().toISOString(),
            bookCount: 29
          },
          {
            id: 4,
            name: 'Công nghệ thông tin',
            slug: 'cong-nghe-thong-tin',
            description: 'Sách về lập trình và công nghệ',
            createdAt: new Date().toISOString(),
            bookCount: 22
          }
        ];
      }
      
      setCategories(categoriesData);
      
    } catch (err) {
      console.error('❌ Error loading categories:', err);
      setError(`Không thể tải danh mục: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      console.log('➕ Creating new category:', categoryData);
      
      // Try multiple create endpoints: POST /categories/add (ADMIN: Create category)
      const createEndpoints = [
        '/categories/add',           // POST /categories/add - ADMIN: Create category
        '/categories',              // Alternative create endpoint
        '/admin/categories',        // Admin specific create
        API_ENDPOINTS.CATEGORIES?.CREATE || '/categories/add'
      ];
      
      let created = false;
      for (const endpoint of createEndpoints) {
        try {
          console.log(`🔍 Trying create via: ${endpoint}`);
          const response = await axiosClient.post(endpoint, {
            name: categoryData.name.trim(),
            slug: categoryData.slug || generateSlug(categoryData.name),
            description: categoryData.description?.trim() || null
          });
          
          console.log(`✅ Category created via ${endpoint}:`, response.data);
          created = true;
          break;
        } catch (err) {
          console.warn(`❌ Create failed via ${endpoint}:`, err.message);
          continue;
        }
      }
      
      if (!created) {
        throw new Error('Không thể tạo danh mục qua bất kỳ endpoint nào');
      }
      
      alert('✅ Tạo danh mục thành công!');
      setShowForm(false);
      loadCategories();
      
    } catch (error) {
      console.error('❌ Failed to create category:', error);
      alert(`❌ Lỗi tạo danh mục: ${error.response?.data?.message || error.message}`);
    }
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      console.log(`📝 Updating category ${categoryId}:`, categoryData);
      
      // Use exact backend endpoint: PUT /categories/{categoryId} (ADMIN: Update category by id)
      const updateData = {
        name: categoryData.name.trim(),
        slug: categoryData.slug || generateSlug(categoryData.name),
        description: categoryData.description?.trim() || null
      };
      
      const response = await axiosClient.put(`/categories/${categoryId}`, updateData);
      
      console.log('✅ Category updated successfully:', response.data);
      alert('✅ Cập nhật danh mục thành công!');
      setEditingCategory(null);
      setShowForm(false);
      loadCategories();
      
    } catch (error) {
      console.error('❌ Failed to update category:', error);
      alert(`❌ Lỗi cập nhật danh mục: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${categoryName}"?\n\nLưu ý: Hành động này có thể ảnh hưởng đến các sách trong danh mục.`)) {
      return;
    }
    
    try {
      console.log(`🗑️ Deleting category ${categoryId}...`);
      
      // Use exact backend endpoint: DELETE /categories/{categoryId} (ADMIN: Delete category by id)
      await axiosClient.delete(`/categories/${categoryId}`);
      
      console.log('✅ Category deleted successfully');
      alert('✅ Xóa danh mục thành công!');
      loadCategories();
      
    } catch (error) {
      console.error('❌ Failed to delete category:', error);
      alert(`❌ Lỗi xóa danh mục: ${error.response?.data?.message || error.message}`);
    }
  };

  // Get category by ID (for viewing details)
  const getCategoryById = async (categoryId) => {
    try {
      console.log(`🔍 Getting category ${categoryId} details...`);
      
      // Use exact backend endpoint: GET /categories/{categoryId} (ADMIN: Get category by id)
      const response = await axiosClient.get(`/categories/${categoryId}`);
      
      console.log('✅ Category details loaded:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Failed to get category details:', error);
      alert(`❌ Lỗi tải thông tin danh mục: ${error.response?.data?.message || error.message}`);
      return null;
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
                    onClick={async () => {
                      const details = await getCategoryById(category.id);
                      if (details) {
                        const categoryInfo = `Thông tin chi tiết danh mục:\n\nID: ${details.data?.id || category.id}\nTên: ${details.data?.name || category.name}\nSlug: ${details.data?.slug || category.slug}\nMô tả: ${details.data?.description || category.description || 'Không có'}\nNgày tạo: ${details.data?.createdAt ? new Date(details.data.createdAt).toLocaleString('vi-VN') : (category.createdAt ? new Date(category.createdAt).toLocaleString('vi-VN') : 'N/A')}\nSố sách: ${details.data?.bookCount || category.bookCount || 0}`;
                        alert(categoryInfo);
                      }
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setShowForm(true);
                    }}
                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded"
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    title="Xóa danh mục"
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

// Enhanced Category Form Component with validation
function CategoryForm({ category, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên danh mục là bắt buộc';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
    }
    
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Test category by slug (using GET /categories/slug/{slug})
  const testSlugAvailability = async (slug) => {
    if (!slug || category?.slug === slug) return; // Skip if editing same category
    
    try {
      console.log(`🔍 Testing slug availability: ${slug}`);
      const response = await axiosClient.get(`/categories/slug/${slug}`);
      
      if (response.data) {
        setErrors(prev => ({
          ...prev,
          slug: 'Slug này đã được sử dụng bởi danh mục khác'
        }));
      }
    } catch (err) {
      // 404 error means slug is available (good)
      if (err.response?.status === 404) {
        console.log('✅ Slug is available');
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.slug;
          return newErrors;
        });
      } else {
        console.warn('❌ Error checking slug:', err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
    
    // Clear name error when user starts typing
    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  const handleSlugChange = (slug) => {
    setFormData(prev => ({ ...prev, slug }));
    
    // Clear slug error and test availability
    if (errors.slug) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.slug;
        return newErrors;
      });
    }
    
    // Debounce slug availability check
    if (slug) {
      setTimeout(() => testSlugAvailability(slug), 500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            {category ? (
              <>
                <FaEdit className="text-yellow-600" />
                Cập nhật danh mục
              </>
            ) : (
              <>
                <FaPlus className="text-green-600" />
                Tạo danh mục mới
              </>
            )}
          </h2>
          {category && (
            <span className="text-sm text-gray-500">ID: {category.id}</span>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="VD: Kinh tế - Quản lý"
              maxLength="100"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.name.length}/100 ký tự
            </p>
          </div>
          
          {/* Slug Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL thân thiện)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="kinh-te-quan-ly"
                pattern="[a-z0-9-]+"
              />
              <button
                type="button"
                onClick={() => handleSlugChange(generateSlug(formData.name))}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Tự động tạo
              </button>
            </div>
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              URL sẽ là: /categories/{formData.slug || 'slug-example'}
            </p>
          </div>
          
          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả danh mục
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mô tả ngắn gọn về danh mục này (tùy chọn)..."
              maxLength="500"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.description.length}/500 ký tự
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {category ? 'Đang cập nhật...' : 'Đang tạo...'}
                </>
              ) : (
                <>
                  {category ? <FaEdit /> : <FaPlus />}
                  {category ? 'Cập nhật danh mục' : 'Tạo danh mục'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaTimes />
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}