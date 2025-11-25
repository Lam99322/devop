// Complete API endpoints mapping based on backend controllers
export const API_ENDPOINTS = {
  // Auth Controller
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout', 
    REFRESH: '/auth/refresh',
    INTROSPECT: '/auth/introspect'
  },

  // User Controller
  USERS: {
    GET_ALL: '/users',
    GET_ALL_SPECIFICATIONS: '/users/specifications', 
    GET_BY_ID: (userId) => `/users/${userId}`,
    GET_ME: '/users/me',
    CREATE: '/users/add',
    UPDATE: (userId) => `/users/${userId}`,
    DELETE: (userId) => `/users/${userId}`,
    UPDATE_PASSWORD: (userId) => `/users/${userId}/update-password`,
    UPDATE_AVATAR: (userId) => `/users/${userId}/update-avatar`,
    UPDATE_STATUS: (userId) => `/users/${userId}/status`
  },

  // Order Controller  
  ORDERS: {
    CREATE: '/orders',
    GET_ALL: '/orders/list',
    GET_BY_ID: (id) => `/orders/${id}`,
    GET_USER_ORDERS: (userId) => `/orders/list/user/${userId}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`
  },

  // Book Controller
  BOOKS: {
    GET_ALL_ADMIN: '/books',
    GET_ALL_SPECIFICATIONS_ADMIN: '/books/specifications',
    GET_ALL_PUBLIC: '/books/list',
    GET_ALL_SPECIFICATIONS_PUBLIC: '/books/list/specifications',
    GET_BY_ID: (bookId) => `/books/${bookId}`,
    GET_BY_SLUG: (slug) => `/books/slug/${slug}`,
    CREATE: '/books/add',
    UPDATE: (bookId) => `/books/${bookId}`,
    DELETE: (bookId) => `/books/${bookId}`,
    UPDATE_STATUS: (bookId) => `/books/${bookId}/status`
  },

  // Category Controller
  CATEGORIES: {
    GET_ALL: '/categories/list',
    GET_BY_ID: (categoryId) => `/categories/${categoryId}`,
    GET_BY_SLUG: (slug) => `/categories/slug/${slug}`,
    CREATE: '/categories/add',
    UPDATE: (categoryId) => `/categories/${categoryId}`,
    DELETE: (categoryId) => `/categories/${categoryId}`
  },

  // Publisher Controller
  PUBLISHERS: {
    GET_ALL_ADMIN: '/publishers',
    GET_ALL_PUBLIC: '/publishers/list',
    GET_BY_ID: (publisherId) => `/publishers/${publisherId}`,
    GET_BY_SLUG: (slug) => `/publishers/slug/${slug}`,
    CREATE: '/publishers/add',
    UPDATE: (publisherId) => `/publishers/${publisherId}`,
    DELETE: (publisherId) => `/publishers/${publisherId}`,
    UPDATE_STATUS: (publisherId) => `/publishers/${publisherId}/status`
  },

  // Review Controller
  REVIEWS: {
    GET_ALL_ADMIN: '/reviews',
    GET_BY_ID: (reviewId) => `/reviews/${reviewId}`,
    GET_BY_USER: (userId) => `/reviews/user/${userId}`,
    GET_BY_BOOK: (bookId) => `/reviews/book/${bookId}`,
    CREATE: '/reviews/add',
    UPDATE: (reviewId) => `/reviews/${reviewId}`,
    DELETE: (reviewId) => `/reviews/${reviewId}`,
    UPDATE_STATUS: (reviewId) => `/reviews/${reviewId}/status`
  },

  // Discount Controller
  DISCOUNTS: {
    GET_ALL: '/discounts',
    GET_BY_ID: (discountId) => `/discounts/${discountId}`,
    CREATE: '/discounts/add',
    UPDATE: (discountId) => `/discounts/${discountId}`,
    DELETE: (discountId) => `/discounts/${discountId}`
  },

  // User Address Controller
  ADDRESSES: {
    GET_ALL_ADMIN: '/addresses',
    GET_BY_USER: (userId) => `/addresses/user/${userId}`,
    GET_BY_ID: (addressId) => `/addresses/${addressId}`,
    CREATE: '/addresses/add',
    UPDATE: (addressId) => `/addresses/${addressId}`,
    DELETE: (addressId) => `/addresses/${addressId}`
  },

  // Role Controller
  ROLES: {
    GET_ALL: '/roles',
    CREATE: '/roles/add',
    DELETE: (roleId) => `/roles/${roleId}`
  },

  // Permission Controller
  PERMISSIONS: {
    GET_ALL: '/permissions',
    CREATE: '/permissions/add',
    DELETE: (permission) => `/permissions/${permission}`
  }
};

export default API_ENDPOINTS;