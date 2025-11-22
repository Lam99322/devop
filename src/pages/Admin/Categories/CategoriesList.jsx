import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import CategoryForm from "./CategoryForm";

export default function CategoriesList() {
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const res = await axiosClient.get("/categories/list");
      setCats(res.data.data || res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(()=>{ load(); }, []);

  const del = async (id) => {
    if(!confirm("Xoá category?")) return;
    try {
      await axiosClient.delete(`/categories/${id}`);
      load();
    } catch (err) { console.error(err); alert("Xoá thất bại"); }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <CategoryForm onSaved={load} />
        {editing && <CategoryForm category={editing} onSaved={() => { setEditing(null); load(); }} />}
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr><th className="p-2">Name</th><th className="p-2">Slug</th><th className="p-2">Actions</th></tr>
        </thead>
        <tbody>
          {cats.map(c => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.slug}</td>
              <td className="p-2">
                <button onClick={()=>setEditing(c)} className="px-3 py-1 bg-yellow-400 rounded mr-2">Edit</button>
                <button onClick={()=>del(c.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
