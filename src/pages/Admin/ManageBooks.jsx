import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import AdminLayout from "../../layouts/AdminLayout";

export default function ManageBooks() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axiosClient.get("/books").then(setBooks).catch(console.error);
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-4">📚 Manage Books</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map(b => (
            <tr key={b.id}>
              <td className="border p-2">{b.title}</td>
              <td className="border p-2">${b.price}</td>
              <td className="border p-2">
                <button className="text-blue-600 mr-3">Edit</button>
                <button className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
