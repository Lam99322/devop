// src/pages/Admin/Users/UserList.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Link } from "react-router-dom";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Xoá người dùng này?")) return;

    try {
      await axiosClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Management</h2>

      <input
        type="text"
        placeholder="Search username/email"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="p-2 border rounded mb-4 w-full"
      />

      <table className="w-full bg-white border rounded shadow-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Username</th>
            <th className="p-2">Email</th>
            <th className="p-2">Status</th>
            <th className="p-2">Role</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2">{u.roles?.map((r) => r.name).join(", ")}</td>

              <td className="p-2 text-right">
                <Link
                  to={`/admin/users/${u.id}`}
                  className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
                >
                  View
                </Link>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
