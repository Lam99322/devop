import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { FaSave, FaTimes, FaSpinner, FaTag } from "react-icons/fa";

export default function CategoryForm({ category = null, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { 
    if (category) {
      setForm({ name: category.name, slug: category.slug || "" });
    } else {
      setForm({ name: "", slug: "" });
    }
    setErrors({});
  }, [category]);

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setForm({ name, slug });
    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
  };

  const handleSlugChange = (e) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setForm(prev => ({ ...prev, slug }));
    if (errors.slug) setErrors(prev => ({ ...prev, slug: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Tên category là bắt buộc";
    if (!form.slug.trim()) newErrors.slug = "Slug là bắt buộc";
    if (form.slug.length < 2) newErrors.slug = "Slug phải có ít nhất 2 ký tự";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const create = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    try {
      console.log("💾 Saving category:", form);
      
      if (category) {
        console.log(`📝 Updating category ID: ${category.id}`);
        const res = await axiosClient.put(`/categories/${category.id}`, form);
        console.log("✅ Update response:", res.data);
      } else {
        console.log("➕ Creating new category");
        const res = await axiosClient.post("/categories", form); // Changed from /categories/add to /categories
        console.log("✅ Create response:", res.data);
      }
      
      alert(category ? "Cập nhật category thành công!" : "Thêm category mới thành công!");
      onSaved && onSaved();
      
      if (!category) {
        setForm({ name: "", slug: "" });
      }
    } catch (err) {
      console.error("❌ Save category error:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        data: err.response?.data
      });
      
      let errorMsg = "Lỗi khi lưu category";
      if (err.response?.status === 400) {
        errorMsg = err.response?.data?.message || "Dữ liệu không hợp lệ";
      } else if (err.response?.status === 409) {
        errorMsg = "Tên category hoặc slug đã tồn tại";
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
          <FaTag className="text-blue-600" />
          {category ? "Sửa Category" : "Thêm Category Mới"}
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

      <form onSubmit={create} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên Category *
          </label>
          <input 
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ví dụ: Văn học, Khoa học..."
            value={form.name} 
            onChange={handleNameChange}
            disabled={saving}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL) *
          </label>
          <input 
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
              errors.slug ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="van-hoc, khoa-hoc..."
            value={form.slug} 
            onChange={handleSlugChange}
            disabled={saving}
          />
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
          <p className="text-gray-500 text-xs mt-1">
            Slug sẽ được tự động tạo từ tên, hoặc bạn có thể chỉnh sửa
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? "Đang lưu..." : "Lưu"}
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
