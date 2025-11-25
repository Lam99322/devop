import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import API_ENDPOINTS from "../../constants/apiEndpoints";
import { FaPlay, FaCode, FaCopy, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ApiTester() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  // Organize endpoints for testing
  const endpointCategories = [
    {
      name: "Auth",
      endpoints: [
        { name: "Login", method: "POST", path: API_ENDPOINTS.AUTH.LOGIN, needsAuth: false },
        { name: "Logout", method: "POST", path: API_ENDPOINTS.AUTH.LOGOUT, needsAuth: true },
        { name: "Get Me", method: "GET", path: API_ENDPOINTS.USERS.GET_ME, needsAuth: true },
      ]
    },
    {
      name: "Users",
      endpoints: [
        { name: "Get All Users", method: "GET", path: API_ENDPOINTS.USERS.GET_ALL, needsAuth: true },
        { name: "Get User by ID", method: "GET", path: API_ENDPOINTS.USERS.GET_BY_ID("1"), needsAuth: true },
      ]
    },
    {
      name: "Orders", 
      endpoints: [
        { name: "Get All Orders", method: "GET", path: API_ENDPOINTS.ORDERS.GET_ALL, needsAuth: true },
        { name: "Get Order by ID", method: "GET", path: API_ENDPOINTS.ORDERS.GET_BY_ID("1"), needsAuth: true },
        { name: "Create Order", method: "POST", path: API_ENDPOINTS.ORDERS.CREATE, needsAuth: false, 
          sampleData: {
            customerName: "Test Customer",
            customerEmail: "test@example.com",
            customerPhone: "0123456789",
            shippingAddress: "123 Test Street, Test City",
            paymentMethod: "CASH_ON_DELIVERY",
            deliveryMethod: "STANDARD_DELIVERY", 
            totalAmount: 150.0,
            notes: "Test order from API tester",
            orderDetails: [
              {
                bookId: "1",
                quantity: 1,
                unitPrice: 150.0
              }
            ]
          }
        }
      ]
    },
    {
      name: "Books",
      endpoints: [
        { name: "Get All Books (Admin)", method: "GET", path: API_ENDPOINTS.BOOKS.GET_ALL_ADMIN, needsAuth: true },
        { name: "Get All Books (Public)", method: "GET", path: API_ENDPOINTS.BOOKS.GET_ALL_PUBLIC, needsAuth: false },
        { name: "Get Book by ID", method: "GET", path: API_ENDPOINTS.BOOKS.GET_BY_ID("1"), needsAuth: false },
      ]
    },
    {
      name: "Categories",
      endpoints: [
        { name: "Get All Categories", method: "GET", path: API_ENDPOINTS.CATEGORIES.GET_ALL, needsAuth: false },
        { name: "Get Category by ID", method: "GET", path: API_ENDPOINTS.CATEGORIES.GET_BY_ID("1"), needsAuth: true },
      ]
    }
  ];

  const testEndpoint = async (endpoint) => {
    setTesting(true);
    const testKey = `${endpoint.method}_${endpoint.path}`;
    
    try {
      console.log(`🧪 Testing ${endpoint.method} ${endpoint.path}...`);
      
      let response;
      if (endpoint.method === 'GET') {
        response = await axiosClient.get(endpoint.path);
      } else if (endpoint.method === 'POST') {
        response = await axiosClient.post(endpoint.path, endpoint.sampleData || {});
      } else if (endpoint.method === 'PUT') {
        response = await axiosClient.put(endpoint.path, endpoint.sampleData || {});
      } else if (endpoint.method === 'DELETE') {
        response = await axiosClient.delete(endpoint.path);
      } else if (endpoint.method === 'PATCH') {
        response = await axiosClient.patch(endpoint.path, endpoint.sampleData || {});
      }
      
      const result = {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => ({ ...prev, [testKey]: result }));
      console.log(`✅ ${endpoint.name} test successful:`, result);
      
    } catch (error) {
      const result = {
        success: false,
        status: error.response?.status || 'NO_RESPONSE',
        statusText: error.response?.statusText || error.message,
        data: error.response?.data || null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => ({ ...prev, [testKey]: result }));
      console.log(`❌ ${endpoint.name} test failed:`, result);
    } finally {
      setTesting(false);
    }
  };

  const testAllEndpoints = async () => {
    for (const category of endpointCategories) {
      for (const endpoint of category.endpoints) {
        await testEndpoint(endpoint);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getResultIcon = (result) => {
    if (!result) return null;
    return result.success ? 
      <FaCheckCircle className="text-green-500" /> : 
      <FaTimesCircle className="text-red-500" />;
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-red-600';
    if (status >= 500) return 'text-red-800';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCode className="text-blue-600" />
          API Endpoint Tester
        </h1>
        <button
          onClick={testAllEndpoints}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          <FaPlay />
          Test All Endpoints
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoint Categories */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Available Endpoints</h2>
          
          {endpointCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-medium text-gray-800">{category.name}</h3>
              </div>
              <div className="divide-y">
                {category.endpoints.map((endpoint, endpointIndex) => {
                  const testKey = `${endpoint.method}_${endpoint.path}`;
                  const result = testResults[testKey];
                  
                  return (
                    <div key={endpointIndex} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getResultIcon(result)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                                endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                                endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {endpoint.method}
                              </span>
                              <span className="font-medium">{endpoint.name}</span>
                              {endpoint.needsAuth && (
                                <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">AUTH</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 font-mono">{endpoint.path}</div>
                            {result && (
                              <div className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                                Status: {result.status} {result.statusText}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => testEndpoint(endpoint)}
                          disabled={testing}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded disabled:opacity-50"
                        >
                          <FaPlay />
                        </button>
                      </div>
                      
                      {result && (
                        <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Response Data:</span>
                            <button
                              onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <FaCopy />
                            </button>
                          </div>
                          <pre className="overflow-auto max-h-32">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Test Results Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Test Results Summary</h2>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).filter(r => r.success).length}
                </div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(testResults).filter(r => !r.success).length}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Recent Test Results:</h3>
              {Object.entries(testResults)
                .sort(([,a], [,b]) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10)
                .map(([key, result]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getResultIcon(result)}
                      <span className="font-mono">{key}</span>
                    </div>
                    <span className={getStatusColor(result.status)}>
                      {result.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium mb-3">Backend Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base URL:</span>
                <span className="font-mono">http://localhost:8080/bookstore</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tests:</span>
                <span>{Object.keys(testResults).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-medium">
                  {Object.keys(testResults).length > 0 ? 
                    Math.round((Object.values(testResults).filter(r => r.success).length / Object.keys(testResults).length) * 100) + '%' :
                    'No tests run'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}