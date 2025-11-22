import React, { useState } from 'react';
import { authAPI } from '../api/apiHelpers';
import cookieUtils from '../utils/cookieUtils';

export default function DebugPanel() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...\n');
    
    try {
      const response = await authAPI.login({ username: 'admin123', password: 'admin123' });
      setResult(prev => prev + '✅ Login success!\n' + JSON.stringify(response.data, null, 2) + '\n\n');
      
      if (response.data?.data?.accessToken) {
        cookieUtils.setAuthToken(response.data.data.accessToken);
        setResult(prev => prev + '✅ Token saved to cookies\n\n');
      }
    } catch (err) {
      setResult(prev => prev + '❌ Login failed:\n' + JSON.stringify({
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      }, null, 2) + '\n\n');
    }
    
    setLoading(false);
  };

  const testUserMe = async () => {
    setLoading(true);
    setResult('Testing /users/me...\n');
    
    const token = cookieUtils.getAuthToken();
    if (!token) {
      setResult(prev => prev + '❌ No token found, login first!\n');
      setLoading(false);
      return;
    }

    setResult(prev => prev + `🔍 Using token: ${token.substring(0, 30)}...\n`);
    setResult(prev => prev + `🔍 Expected user: d11f3cf0-4173-4751-9daa-ccde558c5303 (ADMIN)\n\n`);

    try {
      const response = await fetch('http://localhost:8080/bookstore/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setResult(prev => prev + `Response status: ${response.status}\n`);
      
      const data = await response.text();
      setResult(prev => prev + `Response body: ${data}\n\n`);
      
      if (response.ok) {
        setResult(prev => prev + '✅ /users/me success!\n');
      } else {
        setResult(prev => prev + '❌ /users/me failed\n');
      }
    } catch (err) {
      setResult(prev => prev + '❌ Network error:\n' + err.message + '\n');
    }
    
    setLoading(false);
  };

  const testUserById = async () => {
    setLoading(true);
    setResult('Testing /users/{id}...\n');
    
    const token = cookieUtils.getAuthToken();
    if (!token) {
      setResult(prev => prev + '❌ No token found, login first!\n');
      setLoading(false);
      return;
    }

    const userId = 'd11f3cf0-4173-4751-9daa-ccde558c5303';
    setResult(prev => prev + `🔍 Testing user ID: ${userId}\n\n`);

    try {
      const response = await fetch(`http://localhost:8080/bookstore/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setResult(prev => prev + `Response status: ${response.status}\n`);
      
      const data = await response.text();
      setResult(prev => prev + `Response body: ${data}\n\n`);
      
      if (response.ok) {
        setResult(prev => prev + '✅ /users/{id} success!\n');
      } else {
        setResult(prev => prev + '❌ /users/{id} failed\n');
      }
    } catch (err) {
      setResult(prev => prev + '❌ Network error:\n' + err.message + '\n');
    }
    
    setLoading(false);
  };

  const clearTokens = () => {
    cookieUtils.clearAll();
    setResult('🗑️ All tokens cleared\n');
  };

  // Temporarily disabled to fix crash
  if (true) {
    return null;
  }

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="text-red-600 font-bold mb-2">🔧 DEBUG PANEL</h3>
      
      <div className="flex gap-2 mb-2">
        <button 
          onClick={testLogin}
          disabled={loading}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
        >
          Test Login
        </button>
        <button 
          onClick={testUserMe}
          disabled={loading}
          className="px-2 py-1 bg-green-500 text-white text-xs rounded"
        >
          Test /users/me
        </button>
        <button 
          onClick={testUserById}
          disabled={loading}
          className="px-2 py-1 bg-purple-500 text-white text-xs rounded"
        >
          Test /users/{id}
        </button>
        <button 
          onClick={clearTokens}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded"
        >
          Clear Tokens
        </button>
      </div>

      <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-y-auto whitespace-pre-wrap">
        {result || 'Click buttons to test...'}
      </pre>
    </div>
  );
}