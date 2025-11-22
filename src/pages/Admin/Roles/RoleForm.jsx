import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";

export default function RoleForm({ role=null, onSaved }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ if(role) setForm({ name: role.name, description: role.description || "" }); }, [role]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if(role) {
        // no update API given for role; fallback: delete+create or assume PUT exists - try PUT
        await axiosClient.put(`/roles/${role.id}`, form);
      } else {
        await axiosClient.post("/roles/add", form);
      }
      onSaved && onSaved();
      setForm({ name: "", description: "" });
    } catch (err) {
      console.error(err);
      alert("Lỗi");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="bg-white p-3 rounded shadow w-full max-w-md mb-4">
      <h4 className="font-semibold mb-2">{role ? "Edit Role" : "Add Role"}</h4>
      <input className="w-full border p-2 mb-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
      <input className="w-full border p-2 mb-2" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}/>
      <button className="bg-blue-600 text-white px-3 py-1 rounded">{saving ? "Saving..." : "Save"}</button>
    </form>
  );
}
