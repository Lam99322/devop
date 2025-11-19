import axiosClient from "./axiosClient";

const bookApi = {
  getAll(params) {
    // params: { pageNo, pageSize, sortBy, search, categorySlug }
    // axios sẽ tự encode params, không cần encode thủ công
    return axiosClient.get("/books/list", { params }); // gọi endpoint status ACTIVE
  },

  getById(id) {
    return axiosClient.get(`/books/${id}`);
  },

  getBySlug(slug) {
    return axiosClient.get(`/books/slug/${slug}`);
  }
};

export default bookApi;
