// API endpoints mapping cho backend controllers
import axiosClient, { axiosClientPublic } from "./axiosClient";

/* ========================= AUTH API ========================= */
export const authAPI = {
  login(credentials) {
    return axiosClientPublic.post("/auth/login", credentials);
  },

  logout(token) {
    return axiosClient.post("/auth/logout", { token });
  },

  introspect(token) {
    return axiosClient.post("/auth/introspect", { token });
  },

  refresh(refreshToken) {
    return axiosClientPublic.post("/auth/refresh", { refreshToken });
  }
};

/* ========================= USER API ========================= */
export const userAPI = {
  // Public endpoints
  register(userData) {
    return axiosClientPublic.post("/users/add", userData);
  },

  // Authenticated endpoints
  getMyInfo() {
    return axiosClient.get("/users/me");
  },

  updatePassword(userId, passwordData) {
    return axiosClient.patch(`/users/${userId}/update-password`, passwordData);
  },

  updateAvatar(userId, avatarData) {
    return axiosClient.patch(`/users/${userId}/update-avatar`, avatarData);
  },

  // Admin endpoints
  getAllUsers(params = {}) {
    const { pageNo = 0, pageSize = 12, sortBy = "createdAt:desc", search = "" } = params;
    return axiosClient.get("/users", {
      params: { pageNo, pageSize, sortBy, search },
    });
  },

  getAllUsersWithSpecs(params = {}) {
    const { pageNo = 0, pageSize = 12, sortBy = "createdAt:desc", users = [] } = params;
    return axiosClient.get("/users/specifications", {
      params: { pageNo, pageSize, sortBy, users },
    });
  },

  getUserById(userId) {
    return axiosClient.get(`/users/${userId}`);
  },

  updateUser(userId, userData) {
    return axiosClient.put(`/users/${userId}`, userData);
  },

  deleteUser(userId) {
    return axiosClient.delete(`/users/${userId}`);
  },

  updateUserStatus(userId, status) {
    return axiosClient.patch(`/users/${userId}/status`, null, {
      params: { status },
    });
  }
};

/* ========================= ROLE API ========================= */
export const roleAPI = {
  create(roleData) {
    return axiosClient.post("/roles/add", roleData);
  },

  getAll(params = {}) {
    const { pageNo = 0, pageSize = 12, sortBy = "name:asc", search = "" } = params;
    return axiosClient.get("/roles", {
      params: { pageNo, pageSize, sortBy, search },
    });
  },

  delete(roleId) {
    return axiosClient.delete(`/roles/${roleId}`);
  }
};

/* ========================= DISCOUNT API ========================= */
export const discountAPI = {
  create(discountData) {
    return axiosClient.post("/discounts/add", discountData);
  },

  getAll(params = {}) {
    const { pageNo = 0, pageSize = 12, sortBy = "createdAt:desc", search = "" } = params;
    return axiosClient.get("/discounts", {
      params: { pageNo, pageSize, sortBy, search },
    });
  },

  getById(discountId) {
    return axiosClient.get(`/discounts/${discountId}`);
  },

  update(discountId, discountData) {
    return axiosClient.put(`/discounts/${discountId}`, discountData);
  },

  delete(discountId) {
    return axiosClient.delete(`/discounts/${discountId}`);
  }
};

/* ========================= ORDER API (NEW) ========================= */
export const orderAPI = {
  create(orderData) {
    return axiosClient.post("/orders/add", orderData);
  },

  getAll(params = {}) {
    const { pageNo = 0, pageSize = 12, sortBy = "createdAt:desc", search = "" } = params;
    return axiosClient.get("/orders", {
      params: { pageNo, pageSize, sortBy, search },
    });
  },

  getById(orderId) {
    return axiosClient.get(`/orders/${orderId}`);
  },

  update(orderId, orderData) {
    return axiosClient.put(`/orders/${orderId}`, orderData);
  },

  delete(orderId) {
    return axiosClient.delete(`/orders/${orderId}`);
  }
};
