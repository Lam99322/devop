// Component lifecycle debugging utility
export const useComponentLifecycle = (componentName) => {
  console.log(`🔄 ${componentName}: Component rendering`);
  
  React.useEffect(() => {
    console.log(`✅ ${componentName}: Component mounted`);
    
    return () => {
      console.log(`❌ ${componentName}: Component unmounting`);
    };
  }, [componentName]);
  
  React.useEffect(() => {
    console.log(`🔄 ${componentName}: Component updated`);
  });
};

// Request debugging utility
export const debugRequest = (method, url, data = null) => {
  console.group(`📤 ${method.toUpperCase()} ${url}`);
  console.log('Time:', new Date().toISOString());
  if (data) {
    console.log('Data:', data);
  }
  console.groupEnd();
};

export const debugResponse = (method, url, response, error = null) => {
  if (error) {
    console.group(`❌ ${method.toUpperCase()} ${url} - FAILED`);
    console.log('Status:', error.response?.status);
    console.log('Error:', error.message);
    console.log('Response Data:', error.response?.data);
  } else {
    console.group(`✅ ${method.toUpperCase()} ${url} - SUCCESS`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  }
  console.groupEnd();
};

// State change debugging
export const debugStateChange = (componentName, stateName, oldValue, newValue) => {
  console.log(`🔄 ${componentName}: ${stateName} changed`, {
    from: oldValue,
    to: newValue,
    time: new Date().toISOString()
  });
};