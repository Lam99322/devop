import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";

export default function DiscountForm({ discount=null, onSaved }) {
  const [form, setForm] = useState({ code: "", value: 0, expiryDate: "" });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ if(discount) setForm({ code: discount.code, value: discount.value, expiryDate: discount.expiryDate?.split("T")[0] || "" }); }, [discount]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if(discount) await axiosClient.put(`/discounts/${discount.id}`, form);
      else await axiosClient.post("/discounts/add", form);
      onSaved && onSaved();
      setForm({ code: "", value: 0, expiryDate: "" });
    } catch (err) { console.error(err); alert("Lỗi"); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="bg-white p-3 rounded shadow w-full max-w-md">
      <h4 className="font-semibold mb-2">{discount ? "Edit Discount" : "Add Discount"}</h4>
      <input className="w-full border p-2 mb-2" placeholder="Code" value={form.code} onChange={(e)=>setForm({...form, code:e.target.value})}/>
      <input className="w-full border p-2 mb-2" placeholder="Value (percent)" type="number" value={form.value} onChange={(e)=>setForm({...form, value:Number(e.target.value)})}/>
      <input className="w-full border p-2 mb-2" placeholder="Expiry (YYYY-MM-DD)" type="date" value={form.expiryDate} onChange={(e)=>setForm({...form, expiryDate:e.target.value})}/>
      <button className="bg-blue-600 text-white px-3 py-1 rounded">{saving ? "Saving..." : "Save"}</button>
    </form>
  );
}
