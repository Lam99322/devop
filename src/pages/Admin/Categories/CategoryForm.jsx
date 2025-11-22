import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";

export default function CategoryForm({ category = null, onSaved }) {
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ if(category) setForm({ name: category.name, slug: category.slug || "" }); }, [category]);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if(category) {
        await axiosClient.put(`/categories/${category.id}`, form);
      } else {
        await axiosClient.post("/categories/add", form);
      }
      onSaved && onSaved();
      setForm({ name: "", slug: "" });
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={create} className="bg-white p-3 rounded shadow w-full max-w-md">
      <h4 className="font-semibold mb-2">{category ? "Edit Category" : "Add Category"}</h4>
      <input className="w-full border p-2 mb-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}/>
      <input className="w-full border p-2 mb-2" placeholder="Slug" value={form.slug} onChange={(e)=>setForm({...form, slug: e.target.value})}/>
      <button className="bg-blue-600 text-white px-3 py-1 rounded">{saving ? "Saving..." : "Save"}</button>
    </form>
  );
}
