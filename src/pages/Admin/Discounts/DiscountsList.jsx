import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import DiscountForm from "./DiscountForm";

export default function DiscountsList() {
  const [discounts, setDiscounts] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const res = await axiosClient.get("/discounts");
    setDiscounts(res.data.data?.items || res.data.data || []);
  };

  useEffect(()=>{ load(); }, []);

  const del = async (id) => {
    if(!confirm("Delete discount?")) return;
    try { await axiosClient.delete(`/discounts/${id}`); load(); } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <DiscountForm onSaved={load} />
        {editing && <DiscountForm discount={editing} onSaved={()=>{ setEditing(null); load(); }} />}
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100"><tr><th className="p-2">Code</th><th className="p-2">Value</th><th className="p-2">Expiry</th><th className="p-2">Actions</th></tr></thead>
        <tbody>
          {discounts.map(d => (
            <tr key={d.id} className="border-b">
              <td className="p-2">{d.code}</td>
              <td className="p-2">{d.value}</td>
              <td className="p-2">{new Date(d.expiryDate).toLocaleDateString()}</td>
              <td className="p-2">
                <button onClick={()=>setEditing(d)} className="px-3 py-1 bg-yellow-400 rounded mr-2">Edit</button>
                <button onClick={()=>del(d.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
