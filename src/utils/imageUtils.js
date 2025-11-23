/**
 * Utility functions for handling book images from backend
 */

const BASE_URL = "http://localhost:8080/bookstore";

/**
 * Get book image URL from backend
 * @param {Object} book - Book object
 * @returns {string} Image URL
 */
export const getBookImageUrl = (book) => {
  if (!book) return getPlaceholderUrl();
  
  // Thử các trường ảnh có thể có từ backend
  const imageField = book.thumbnail || book.bookThumbnail || book.image || book.imageUrl;
  
  if (imageField) {
    // Nếu đã là URL đầy đủ (http/https)
    if (imageField.startsWith('http')) {
      return imageField;
    }
    // Nếu là đường dẫn tương đối thì tạo URL backend
    return `${BASE_URL}/images/books/${imageField}`;
  }
  
  // Fallback về ảnh từ API hoặc placeholder
  if (book.id) {
    // Thử lấy ảnh từ API endpoint
    return `${BASE_URL}/api/books/${book.id}/image`;
  }
  
  // Cuối cùng mới dùng placeholder
  return getPlaceholderUrl(book.title, 300, 400);
};

/**
 * Get placeholder image URL
 * @param {string} text - Text to show in placeholder
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Placeholder URL
 */
export const getPlaceholderUrl = (text = 'Book', width = 300, height = 400) => {
  // Dùng ảnh stock book thật thay vì placeholder text
  const bookImages = [
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
  ];
  
  // Chọn ảnh dựa trên hash của text để ảnh consistent
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % bookImages.length;
  return bookImages[index];
};

/**
 * Handle image error by setting placeholder
 * @param {Event} e - Error event
 * @param {string} fallbackText - Text for fallback
 */
export const handleImageError = (e, fallbackText = 'Book') => {
  const currentSrc = e.target.src;
  
  // Nếu đang là ảnh từ /images/books/ thì thử endpoint khác
  if (currentSrc.includes('/images/books/')) {
    const bookId = e.target.getAttribute('data-book-id');
    if (bookId) {
      e.target.src = `${BASE_URL}/api/books/${bookId}/thumbnail`;
      return;
    }
  }
  
  // Nếu đang là ảnh từ API thì thử static files
  if (currentSrc.includes('/api/books/')) {
    e.target.src = `${BASE_URL}/static/book-covers/default.jpg`;
    return;
  }
  
  // Cuối cùng mới dùng stock image
  e.target.src = getPlaceholderUrl(fallbackText);
};

/**
 * Get user avatar URL
 * @param {Object} user - User object
 * @returns {string} Avatar URL
 */
export const getUserAvatarUrl = (user) => {
  if (user?.avatar) {
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${BASE_URL}/images/avatars/${user.avatar}`;
  }
  
  // Return placeholder with user initial
  const initial = user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U';
  return `https://via.placeholder.com/150/3b82f6/ffffff?text=${initial}`;
};

// Chỉ dùng named exports để tránh conflict
// export default {
//   getBookImageUrl,
//   getPlaceholderUrl, 
//   handleImageError,
//   getUserAvatarUrl
// };