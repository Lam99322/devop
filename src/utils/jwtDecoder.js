// JWT Decoder utility
export const decodeJWT = (token) => {
  try {
    // JWT có 3 phần: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode payload (phần thứ 2)
    const payload = parts[1];
    
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decoded = atob(paddedPayload);
    
    // Parse JSON
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

// Utility to check if token is expired
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

// Utility to get user info from token
export const getUserFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return {
    id: decoded.sub || decoded.userId || decoded.id,
    username: decoded.username || decoded.sub,
    email: decoded.email,
    roles: decoded.roles || decoded.authorities || [],
    role: decoded.role,
    exp: decoded.exp,
    iat: decoded.iat
  };
};

export default { decodeJWT, isTokenExpired, getUserFromToken };