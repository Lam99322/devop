import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";

export default function PermissionsList() {
  const [perms, setPerms] = useState([]);
  const [name, setName] = useState("");

  const load = async () => {
    const res = await axiosClient.get("/permissions");
    setPerms(res.data.data || res.data);
  };

  useEffect(()=>{ load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/permissions/add", { name });
      setName("");
      load();
    } catch (err) { console.error(err); alert("Lỗi"); }
  };

  const del = async (n) => {
    if(!confirm("Delete permission?")) return;
    try { await axiosClient.delete(`/permissions/${n}`); load(); } catch (err) { console.error(err); }
  };

  return (
    <div>
      <form onSubmit={create} className="mb-4 flex gap-2">
        <input value={name} onChange={(e)=>setName(e.target.value)} className="border p-2" placeholder="Permission name"/>
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
      </form>

      <ul className="bg-white rounded shadow divide-y">
        {perms.map(p => (
          <li key={p.name} className="p-2 flex justify-between items-center">
            <div>{p.name} <span className="text-sm text-gray-500">- {p.description}</span></div>
            <button onClick={()=>del(p.name)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
