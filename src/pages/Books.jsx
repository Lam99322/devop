import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import API_ENDPOINTS from "../constants/apiEndpoints";
import BookCard from "../components/BookCard/BookCard";

function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Use exact backend endpoint: GET /books/list (Get all books with status ACTIVE)
    axiosClient.get(API_ENDPOINTS.BOOKS.GET_ALL_PUBLIC)
      .then((res) => {
        console.log("✅ Public books from backend:", res.data);
        
        // Handle ApiResponse structure
        let booksData = [];
        if (res.data?.data && Array.isArray(res.data.data)) {
          booksData = res.data.data;
        } else if (Array.isArray(res.data)) {
          booksData = res.data;
        }
        
        setBooks(booksData);
        console.log(`📚 Loaded ${booksData.length} active books for public`);
      })
      .catch((err) => {
        console.error("❌ Error fetching public books:", err);
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
