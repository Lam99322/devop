// Debug utility to analyze API errors
export const analyzeError = (error, context = "") => {
  console.group(`🔍 Error Analysis: ${context}`);
  
  console.log("📋 Full Error Object:", error);
  
  if (error.response) {
    console.log("📤 Request Details:");
    console.log("  URL:", error.config?.url);
    console.log("  Method:", error.config?.method?.toUpperCase());
    console.log("  Headers:", error.config?.headers);
    console.log("  Data:", error.config?.data);
    
    console.log("📥 Response Details:");
    console.log("  Status:", error.response.status);
    console.log("  Status Text:", error.response.statusText);
    console.log("  Headers:", error.response.headers);
    console.log("  Data:", error.response.data);
    
    // Analyze specific error types
    switch (error.response.status) {
      case 400:
        console.log("🔍 400 Bad Request Analysis:");
        console.log("- Request data format is incorrect");
        console.log("- Missing required fields");
        console.log("- Invalid data types");
        console.log("- Check DTO structure in backend");
        break;
        
      case 401:
        console.log("🔍 401 Unauthorized Analysis:");
        console.log("- JWT token missing or invalid");
        console.log("- Token expired");
        console.log("- Need to login again");
        break;
        
      case 403:
        console.log("🔍 403 Forbidden Analysis:");
        console.log("- User doesn't have permission");
        console.log("- Role-based access denied");
        console.log("- Need admin privileges");
        break;
        
      case 404:
        console.log("🔍 404 Not Found Analysis:");
        console.log("- Endpoint doesn't exist");
        console.log("- URL path is incorrect");
        console.log("- Controller mapping missing");
        break;
        
      case 405:
        console.log("🔍 405 Method Not Allowed Analysis:");
        console.log("- HTTP method not supported on this endpoint");
        console.log("- Backend expects different method (GET vs POST)");
        console.log("- Check @RequestMapping annotations");
        break;
        
      case 500:
        console.log("🔍 500 Internal Server Error Analysis:");
        console.log("- Backend application error");
        console.log("- Database connection issue");
        console.log("- Check Spring Boot logs");
        break;
    }
  } else if (error.request) {
    console.log("📤 Request made but no response received:");
    console.log("  Request:", error.request);
    console.log("🔍 Possible causes:");
    console.log("- Backend server not running");
    console.log("- Network connectivity issue");
    console.log("- CORS problem");
    console.log("- Wrong backend URL");
  } else {
    console.log("🔍 Error setting up request:");
    console.log("  Message:", error.message);
  }
  
  console.groupEnd();
  
  // Return human-readable summary
  return {
    type: error.response ? 'HTTP_ERROR' : error.request ? 'NETWORK_ERROR' : 'REQUEST_ERROR',
    status: error.response?.status,
    message: error.response?.data?.message || error.message,
    suggestion: getSuggestion(error)
  };
};

const getSuggestion = (error) => {
  if (!error.response) {
    return "Kiểm tra xem Spring Boot backend có đang chạy trên localhost:8080 không";
  }
  
  switch (error.response.status) {
    case 400:
      return "Kiểm tra format dữ liệu gửi lên có khớp với DTO của backend không";
    case 401:
      return "Đăng nhập lại để lấy JWT token mới";
    case 403:
      return "Đảm bảo user có quyền admin để thực hiện thao tác này";
    case 404:
      return "Kiểm tra endpoint URL có đúng với Controller mapping không";
    case 405:
      return "Kiểm tra HTTP method (GET/POST) có đúng với backend endpoint không";
    case 500:
      return "Kiểm tra logs của Spring Boot server để xem lỗi chi tiết";
    default:
      return "Lỗi không xác định, kiểm tra logs backend";
  }
};

export const logRequest = (config) => {
  console.group("📤 Outgoing Request");
  console.log("URL:", `${config.baseURL}${config.url}`);
  console.log("Method:", config.method?.toUpperCase());
  console.log("Headers:", config.headers);
  if (config.data) {
    console.log("Data:", typeof config.data === 'string' ? JSON.parse(config.data) : config.data);
  }
  console.groupEnd();
};

export const logResponse = (response) => {
  console.group("📥 Incoming Response");
  console.log("Status:", response.status, response.statusText);
  console.log("Headers:", response.headers);
  console.log("Data:", response.data);
  console.groupEnd();
};