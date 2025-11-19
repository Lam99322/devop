import { useEffect, useState } from "react";
import bookApi from "../api/bookApi";
import BookCard from "../components/BookCard/BookCard";

function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    bookApi.getAll()
      .then((res) => {
        console.log("Books from backend:", res.data);
        setBooks(res.data.data || res.data);
      })
      .catch((err) => {
        console.error("Error fetching books", err);
      });
  }, []);

  return (
    <div className="p-4">
      {books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">Không có sách nào.</p>
      )}
    </div>
  );
}

export default Books;
