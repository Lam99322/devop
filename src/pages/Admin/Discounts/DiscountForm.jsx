import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { FaSpinner, FaPlus, FaEdit } from "react-icons/fa";

export default function DiscountForm({ discount = null, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    percent: 0,
    startDate: "",
    endDate: ""
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (discount) {
      setForm({
        name: discount.name || discount.description || "",
        code: discount.code || "",
        percent: discount.percent || discount.discountPercent || 0,
        startDate: discount.startDate?.split("T")[0] || "",
        endDate: discount.endDate?.split("T")[0] || discount.expiryDate?.split("T")[0] || ""
      });
    } else {
      setForm({
        name: "",
        code: "",
        percent: 0,
        startDate: "",
        endDate: ""
      });
    }
  }, [discount]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = "Tên mã giảm giá là bắt buộc";
    if (!form.code.trim()) newErrors.code = "Mã giảm giá là bắt buộc";
    if (!/^[A-Z0-9]*$/.test(form.code)) newErrors.code = "Mã chỉ được chứa chữ in hoa và số";
    if (form.percent < 1 || form.percent > 100) newErrors.percent = "Phần trăm phải từ 1-100";
    if (!form.startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    if (!form.endDate) newErrors.endDate = "Ngày kết thúc là bắt buộc";
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Prepare data for backend (matches DiscountRequest)
      const discountData = {
        name: form.name.trim(),
        code: form.code.toUpperCase().trim(),
        percent: parseInt(form.percent),
        startDate: form.startDate,
        endDate: form.endDate
      };

      let response;
      if (discount) {
        // Check if discount has a valid ID (try multiple field names)
        const discountId = discount.id || discount._id || discount.discountId || discount.code;
        
        if (!discountId) {
          console.error("No valid ID found in discount object:", discount);
          console.error("Available fields:", Object.keys(discount));
          throw new Error("Discount ID is missing for update operation");
        }
        
        // Backend uses PUT /discounts/{discountId}
        const updateEndpoints = [
          { method: 'put', url: `/discounts/${discountId}` }
        ];
        
        let updated = false;
        let lastError = null;
        
        for (const endpoint of updateEndpoints) {
          try {
            console.log(`🔄 Trying ${endpoint.method.toUpperCase()} ${endpoint.url}`);
            
            // Include ID in request body for endpoints that don't have it in URL
            const requestData = endpoint.url.includes(discountId) 
              ? discountData 
              : { ...discountData, id: discountId };
            
            if (endpoint.method === 'put') {
              response = await axiosClient.put(endpoint.url, requestData);
            } else if (endpoint.method === 'post') {
              response = await axiosClient.post(endpoint.url, requestData);
            } else if (endpoint.method === 'patch') {
              response = await axiosClient.patch(endpoint.url, requestData);
            }
            
            console.log(`✅ Update successful via ${endpoint.method.toUpperCase()} ${endpoint.url}`);
            updated = true;
            break;
          } catch (err) {
            console.warn(`❌ ${endpoint.method.toUpperCase()} ${endpoint.url} failed:`, err.response?.status, err.response?.data?.message || err.message);
            lastError = err;
            continue;
          }
        }
        
        if (!updated) {
          const errorMsg = lastError?.response?.data?.message || lastError?.message || "Không thể cập nhật mã giảm giá";
          throw new Error(errorMsg);
        }
      } else {
        // Backend uses POST /discounts/add
        const createEndpoints = [
          "/discounts/add"
        ];
        
        let created = false;
        let lastError = null;
        
        for (const endpoint of createEndpoints) {
          try {
            console.log(`🔄 Trying POST ${endpoint}`);
            response = await axiosClient.post(endpoint, discountData);
            console.log(`✅ Created via POST ${endpoint}`);
            created = true;
            break;
          } catch (err) {
            console.warn(`❌ POST ${endpoint} failed:`, err.response?.status, err.response?.data?.message || err.message);
            lastError = err;
            continue;
          }
        }
        
        if (!created) {
          const errorMsg = lastError?.response?.data?.message || lastError?.message || "Không thể tạo mã giảm giá";
          throw new Error(errorMsg);
        }
      }

      alert(`✅ ${discount ? 'Cập nhật' : 'Tạo'} mã giảm giá thành công!`);
      onSaved && onSaved();
      
      if (!discount) {
        // Reset form after creating new discount
        setForm({
          code: "",
          description: "",
          discountPercent: 0,
          value: 0,
          minOrderAmount: 0,
          maxDiscountAmount: 0,
          expiryDate: "",
          isActive: true
        });
      }
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      alert(`❌ Lỗi: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
        {discount ? <FaEdit className="text-yellow-600" /> : <FaPlus className="text-green-600" />}
        {discount ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
      </h4>
      
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên mã giảm giá *</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="VD: Giảm giá mùa hè"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá *</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="VD: WELCOME10"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            maxLength="50"
            required
          />
          {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm giảm giá (1-100) *</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.percent ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="10"
            type="number"
            min="1"
            max="100"
            value={form.percent}
            onChange={(e) => setForm({ ...form, percent: Number(e.target.value) })}
            required
          />
          {errors.percent && <p className="text-red-500 text-xs mt-1">{errors.percent}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            min={form.startDate || new Date().toISOString().split('T')[0]}
            required
          />
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                {discount ? 'Đang cập nhật...' : 'Đang tạo...'}
              </>
            ) : (
              <>
                {discount ? <FaEdit /> : <FaPlus />}
                {discount ? 'Cập nhật' : 'Tạo mới'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
