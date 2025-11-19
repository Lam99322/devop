import { Link } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency";

function BookCard({ book }) {
  return (
    <div className="border rounded p-3">
      <img
        src={book.thumbnail}
        alt={book.title}
        className="w-full h-48 object-cover"
      />
      <h3 className="font-bold text-lg mt-2">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.author}</p>
      <p className="text-red-600 font-semibold mt-2">
        {formatCurrency(book.price)}
      </p>

      <Link
        to={`/books/${book.id}`}
        className="block mt-2 bg-blue-500 text-white text-center py-1 rounded"
      >
        Xem chi tiết
      </Link>
    </div>
  );
}

export default BookCard;
