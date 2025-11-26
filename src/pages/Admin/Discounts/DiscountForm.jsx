import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { FaSpinner, FaPlus, FaEdit } from "react-icons/fa";

export default function DiscountForm({ discount = null, onSaved }) {
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountPercent: 0,
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    expiryDate: "",
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (discount) {
      setForm({
        code: discount.code || "",
        description: discount.description || "",
        discountPercent: discount.discountPercent || 0,
        value: discount.value || 0,
        minOrderAmount: discount.minOrderAmount || 0,
        maxDiscountAmount: discount.maxDiscountAmount || 0,
        expiryDate: discount.expiryDate?.split("T")[0] || discount.validTo?.split("T")[0] || "",
        isActive: discount.isActive !== false
      });
    } else {
      // Reset form for new discount
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
  }, [discount]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.code.trim()) newErrors.code = "Mã giảm giá là bắt buộc";
    if (!form.description.trim()) newErrors.description = "Mô tả là bắt buộc";
    if (form.discountPercent <= 0 && form.value <= 0) {
      newErrors.value = "Phải có giá trị giảm giá (% hoặc số tiền)";
    }
    if (form.discountPercent > 100) newErrors.discountPercent = "Phần trăm không được vượt quá 100%";
    if (!form.expiryDate) newErrors.expiryDate = "Ngày hết hạn là bắt buộc";
    
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
      console.log(`💾 ${discount ? 'Updating' : 'Creating'} discount:`, form);
      
      // Prepare data for backend
      const discountData = {
        ...form,
        code: form.code.toUpperCase().trim(),
        expiryDate: form.expiryDate + "T23:59:59",
        validTo: form.expiryDate + "T23:59:59"
      };

      let response;
      if (discount) {
        // Try multiple update endpoints
        const updateEndpoints = [
          `/discounts/${discount.id}`,
          `/admin/discounts/${discount.id}`,
          `/discounts/update/${discount.id}`
        ];
        
        let updated = false;
        for (const endpoint of updateEndpoints) {
          try {
            response = await axiosClient.put(endpoint, discountData);
            console.log(`✅ Updated via ${endpoint}`);
            updated = true;
            break;
          } catch (err) {
            console.warn(`❌ Update failed via ${endpoint}:`, err.message);
            continue;
          }
        }
        
        if (!updated) throw new Error("Không thể cập nhật mã giảm giá");
      } else {
        // Try multiple create endpoints
        const createEndpoints = [
          "/discounts",
          "/discounts/add",
          "/admin/discounts",
          "/discounts/create"
        ];
        
        let created = false;
        for (const endpoint of createEndpoints) {
          try {
            response = await axiosClient.post(endpoint, discountData);
            console.log(`✅ Created via ${endpoint}`);
            created = true;
            break;
          } catch (err) {
            console.warn(`❌ Create failed via ${endpoint}:`, err.message);
            continue;
          }
        }
        
        if (!created) throw new Error("Không thể tạo mã giảm giá");
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
      console.error('❌ Discount operation failed:', err);
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá *</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="VD: WELCOME10"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            maxLength="20"
            required
          />
          {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Mô tả mã giảm giá"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giảm theo % (0-100)</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.discountPercent ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="10"
            type="number"
            min="0"
            max="100"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
          />
          {errors.discountPercent && <p className="text-red-500 text-xs mt-1">{errors.discountPercent}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hoặc giảm số tiền (VNĐ)</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="50000"
            type="number"
            min="0"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="100000"
            type="number"
            min="0"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="50000"
            type="number"
            min="0"
            value={form.maxDiscountAmount}
            onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn *</label>
          <input
            className={`w-full px-3 py-2 border rounded-lg ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Kích hoạt ngay
          </label>
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
