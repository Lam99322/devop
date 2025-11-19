import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    "Sách kinh tế",
    "Văn học nước ngoài",
    "Văn học trong nước",
    "Sách kỹ năng sống",
    "Sách tuổi teen",
    "Học ngoại ngữ",
    "Sách thiếu nhi",
    "Sách chuyên ngành",
    "Thưởng thức đời sống",
    "Văn phòng phẩm"
  ];

  return (
    <aside className="w-full bg-white shadow border rounded p-4">
      <h3 className="font-bold text-lg mb-3">Nổi bật</h3>

      <ul className="space-y-2">
        {menu.map((item) => (
          <li key={item}>
            <Link
              to={`/category/${item}`}
              className="block p-2 hover:bg-green-100 rounded"
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
