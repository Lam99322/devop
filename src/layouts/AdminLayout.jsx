export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-56 bg-gray-800 text-white min-h-screen p-5">
        <p className="font-bold text-xl">Admin</p>
        <ul className="mt-5 space-y-3">
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/admin/books">Manage Books</a></li>
          <li><a href="/admin/orders">Manage Orders</a></li>
        </ul>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
