import { Link } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency";
import "./bookcard.css";

export default function BookCard({ data }) {
  return (
    <Link to={`/books/${data.id}`} className="book-card">
      <div className="book-img bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700">
        <div className="text-center">
          <div className="text-2xl">📚</div>
          <div className="text-xs mt-1">{data.title?.substring(0, 10)}</div>
        </div>
      </div>
      <h3 className="book-title">{data.title}</h3>
      <p className="book-price">{formatCurrency(data.price)}</p>
    </Link>
  );
}
