// Test API endpoints - Temporary debug component
import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

const APITester = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async (method, endpoint, data = null) => {
    setLoading(true);
    try {
      console.log(`🔍 Testing ${method} ${endpoint}`, data ? { data } : '');
      
      let response;
      switch (method) {
        case 'GET':
          response = await axiosClient.get(endpoint);
          break;
        case 'POST':
          response = await axiosClient.post(endpoint, data);
          break;
        case 'PUT':
          response = await axiosClient.put(endpoint, data);
          break;
        case 'DELETE':
          response = await axiosClient.delete(endpoint);
          break;
      }
      
      setResult(`✅ ${method} ${endpoint} SUCCESS\nStatus: ${response.status}\nData: ${JSON.stringify(response.data, null, 2)}`);
      console.log(`✅ ${method} ${endpoint} success:`, response.data);
      
    } catch (error) {
      const errorMsg = `❌ ${method} ${endpoint} FAILED\nStatus: ${error.response?.status}\nMessage: ${error.response?.data?.message || error.message}\nData: ${JSON.stringify(error.response?.data, null, 2)}`;
      setResult(errorMsg);
      console.error(`❌ ${method} ${endpoint} error:`, error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const sampleBook = {
    title: 'Test Book API',
    author: 'Test Author',
    price: 100000,
    category: 'Test Category',
    stock: 10,
    description: 'Test book for API',
    image: 'https://example.com/test.jpg'
  };

  const sampleCategory = {
    name: 'Test API Category',
    slug: 'test-api-category'
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 API Endpoint Tester</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Books API */}
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">📚 Books API</h3>
          <div className="space-y-2">
            <button onClick={() => testAPI('GET', '/books')} className="w-full bg-blue-500 text-white p-2 rounded">
              GET /books
            </button>
            <button onClick={() => testAPI('POST', '/books', sampleBook)} className="w-full bg-green-500 text-white p-2 rounded">
              POST /books (Create)
            </button>
            <button onClick={() => testAPI('PUT', '/books/1', sampleBook)} className="w-full bg-yellow-500 text-white p-2 rounded">
              PUT /books/1 (Update)
            </button>
            <button onClick={() => testAPI('DELETE', '/books/1')} className="w-full bg-red-500 text-white p-2 rounded">
              DELETE /books/1
            </button>
          </div>
        </div>

        {/* Categories API */}
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">📂 Categories API</h3>
          <div className="space-y-2">
            <button onClick={() => testAPI('GET', '/categories/list')} className="w-full bg-blue-500 text-white p-2 rounded">
              GET /categories/list
            </button>
            <button onClick={() => testAPI('POST', '/categories', sampleCategory)} className="w-full bg-green-500 text-white p-2 rounded">
              POST /categories (Create)
            </button>
            <button onClick={() => testAPI('PUT', '/categories/1', sampleCategory)} className="w-full bg-yellow-500 text-white p-2 rounded">
              PUT /categories/1 (Update)
            </button>
            <button onClick={() => testAPI('DELETE', '/categories/1')} className="w-full bg-red-500 text-white p-2 rounded">
              DELETE /categories/1
            </button>
          </div>
        </div>

        {/* Orders API */}
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">📦 Orders API</h3>
          <div className="space-y-2">
            <button onClick={() => testAPI('GET', '/orders/list')} className="w-full bg-blue-500 text-white p-2 rounded">
              GET /orders/list
            </button>
            <button onClick={() => testAPI('GET', '/orders')} className="w-full bg-blue-500 text-white p-2 rounded">
              GET /orders
            </button>
            <button onClick={() => testAPI('GET', '/admin/orders')} className="w-full bg-blue-500 text-white p-2 rounded">
              GET /admin/orders
            </button>
            <button onClick={() => testAPI('GET', '/api/orders')} className="w-full bg-blue-500 text-white p-2 rounded">
              GET /api/orders
            </button>
            <button onClick={() => {
              const testOrder = {
                items: [{ id: 1, title: "Test Book", price: 100000, quantity: 1 }],
                customerInfo: { fullName: "Test", email: "test@test.com", phone: "123", address: "Test" },
                total: 100000
              };
              testAPI('POST', '/orders/create', testOrder);
            }} className="w-full bg-green-500 text-white p-2 rounded">
              POST /orders/create (Test Order)
            </button>
          </div>
        </div>

        {/* Auth Test */}
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">🔐 Auth Test</h3>
          <div className="space-y-2">
            <button onClick={() => {
              const token = document.cookie.split(';').find(c => c.trim().startsWith('authToken='));
              setResult(token ? `✅ Token found: ${token.split('=')[1].substring(0, 50)}...` : '❌ No auth token found');
            }} className="w-full bg-purple-500 text-white p-2 rounded">
              Check Auth Token
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="border rounded p-4">
        <h3 className="font-bold mb-2">📊 Results</h3>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Testing...</span>
          </div>
        ) : (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
            {result || 'Click a button to test API endpoints...'}
          </pre>
        )}
      </div>
    </div>
  );
};

export default APITester;