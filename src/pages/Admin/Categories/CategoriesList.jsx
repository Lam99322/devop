import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import CategoryForm from "./CategoryForm";
import { FaEdit, FaTrash, FaPlus, FaList, FaSpinner } from "react-icons/fa";

export default function CategoriesList() {
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Loading categories from backend...");
      
      const res = await axiosClient.get("/categories/list");
      console.log("📂 Categories API response:", res.data);
      
      // Handle different response structures
      let catsData = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          catsData = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          catsData = res.data.data;
        } else if (res.data.content && Array.isArray(res.data.content)) {
          catsData = res.data.content;
        } else if (res.data.categories && Array.isArray(res.data.categories)) {
          catsData = res.data.categories;
        }
      }
      
      console.log("📦 Processed categories data:", catsData);
      setCats(catsData);
      
      if (catsData.length === 0) {
        setError("Chưa có category nào trong hệ thống.");
      }
    } catch (err) {
      console.error("❌ Error loading categories:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        url: err.config?.url
      });
      
      setError(`Không thể tải danh sách categories từ backend (${err.response?.status || 'Network Error'}). Vui lòng kiểm tra kết nối.`);
      setCats([]); // Don't use mock data, show empty state instead
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    const catsArray = Array.isArray(cats) ? cats : [];
    const category = catsArray.find(c => c.id === id);
    if (!confirm(`Bạn có chắc muốn xóa category "${category?.name}"?`)) return;
    
    try {
      setDeleting(id);
      await axiosClient.delete(`/categories/${id}`);
      setCats(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter(c => c.id !== id);
      });
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại! Vui lòng thử lại.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaList className="text-blue-600" />
            Quản lý Categories
          </h1>
          <p className="text-gray-600">Thêm, sửa, xóa các danh mục sách</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Thêm Category
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
          <button
            onClick={() => {
              console.log("🎭 Loading mock categories for testing...");
              setCats([
                { id: 1, name: "Văn học", slug: "van-hoc" },
                { id: 2, name: "Khoa học", slug: "khoa-hoc" },
                { id: 3, name: "Thiếu nhi", slug: "thieu-nhi" },
                { id: 4, name: "Kỹ năng sống", slug: "ky-nang-song" },
                { id: 5, name: "Lịch sử", slug: "lich-su" }
              ]);
              setError(null);
            }}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Dùng dữ liệu mẫu để test
          </button>
        </div>
      )}

      {/* Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showForm && (
          <CategoryForm 
            onSaved={() => {
              load();
              setShowForm(false);
            }} 
            onCancel={() => setShowForm(false)}
          />
        )}
        {editing && (
          <CategoryForm 
            category={editing} 
            onSaved={() => { 
              setEditing(null); 
              load(); 
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="font-semibold text-gray-800">Danh sách Categories ({Array.isArray(cats) ? cats.length : 0})</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : !Array.isArray(cats) || cats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Chưa có category nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">ID</th>
                  <th className="text-left p-4 font-medium text-gray-700">Tên</th>
                  <th className="text-left p-4 font-medium text-gray-700">Slug</th>
                  <th className="text-left p-4 font-medium text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(cats) ? cats : []).map(c => (
                  <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">#{c.id}</td>
                    <td className="p-4 font-medium text-gray-800">{c.name}</td>
                    <td className="p-4 text-sm text-gray-600 font-mono bg-gray-100 rounded px-2 py-1">{c.slug || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditing(c)}
                          disabled={deleting === c.id}
                          className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          <FaEdit />
                          Sửa
                        </button>
                        <button 
                          onClick={() => del(c.id)}
                          disabled={deleting === c.id}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {deleting === c.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                          {deleting === c.id ? 'Đang xóa...' : 'Xóa'}
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
    </div>
  );
}
