import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import cookieUtils from '../utils/cookieUtils';

export default function AuthDebug() {
  const { user, token, isLoading } = useContext(AuthContext);
  const [cookieToken, setCookieToken] = useState('');

  useEffect(() => {
    const updateCookieToken = () => {
      setCookieToken(cookieUtils.getAuthToken() || 'No token');
    };
    
    updateCookieToken();
    const interval = setInterval(updateCookieToken, 1000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs z-50 max-w-xs">
      <div><strong>Auth Debug:</strong></div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.username || user.name || 'Anonymous' : 'None'}</div>
      <div>Context Token: {token ? `${token.substring(0, 10)}...` : 'None'}</div>
      <div>Cookie Token: {cookieToken !== 'No token' ? `${cookieToken.substring(0, 10)}...` : cookieToken}</div>
      <button 
        onClick={() => cookieUtils.debugCookies()}
        className="bg-blue-500 px-1 py-0.5 mt-1 rounded text-xs"
      >
        Log Cookies
      </button>
    </div>
  );
}