import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import RoleForm from "./RoleForm";

export default function RolesList() {
  const [roles, setRoles] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const res = await axiosClient.get("/roles");
    setRoles(res.data.data || res.data);
  };

  useEffect(()=>{ load(); }, []);

  const del = async (id) => {
    if(!confirm("Delete role?")) return;
    try { await axiosClient.delete(`/roles/${id}`); load(); } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="mb-4">
        <RoleForm onSaved={load} />
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th className="p-2">Description</th><th className="p-2">Actions</th></tr></thead>
        <tbody>
          {roles.map(r => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.description}</td>
              <td className="p-2">
                <button onClick={()=>setEditing(r)} className="px-3 py-1 bg-yellow-400 rounded mr-2">Edit</button>
                <button onClick={()=>del(r.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && <RoleForm role={editing} onSaved={()=>{ setEditing(null); load(); }} />}
    </div>
  );
}
