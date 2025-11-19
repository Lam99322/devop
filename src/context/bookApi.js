import axios from "axios";

const API = "http://localhost:8080/api/books";

export const getAllBooks = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getBookById = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};
