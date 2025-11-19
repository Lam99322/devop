import { Link } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency";
import "./bookcard.css";

export default function BookCard({ data }) {
  return (
    <Link to={`/books/${data.id}`} className="book-card">
      <img src={data.imageUrl} className="book-img" />
      <h3 className="book-title">{data.title}</h3>
      <p className="book-price">{formatCurrency(data.price)}</p>
    </Link>
  );
}
