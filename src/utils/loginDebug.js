// Debug utility for login response structure
export const debugLoginResponse = (response) => {
  console.log("🔍 DEBUGGING LOGIN RESPONSE:");
  console.log("Full response object:", response);
  
  if (response?.data) {
    console.log("response.data:", response.data);
    
    if (response.data.data) {
      console.log("response.data.data:", response.data.data);
      
      if (response.data.data.accessToken) {
        console.log("✅ Token found at: response.data.data.accessToken");
        console.log("Token length:", response.data.data.accessToken.length);
        
        // Try to decode JWT
        try {
          const token = response.data.data.accessToken;
          const parts = token.split('.');
          const payload = JSON.parse(atob(parts[1] + '='.repeat((4 - parts[1].length % 4) % 4)));
          console.log("🔓 JWT Payload:", payload);
          
          // Look for user ID in JWT
          const possibleUserIds = [
            payload.sub,
            payload.userId, 
            payload.id,
            payload.user_id,
            payload.jti
          ];
          
          console.log("🆔 Possible User IDs from JWT:", possibleUserIds.filter(id => id));
          
        } catch (e) {
          console.error("❌ Failed to decode JWT:", e);
        }
      }
      
      if (response.data.data.user) {
        console.log("✅ User info found at: response.data.data.user");
        console.log("User object:", response.data.data.user);
      } else {
        console.log("❌ No user info at response.data.data.user");
        
        // Check other possible locations
        const locations = [
          { path: "response.data.user", value: response.data.user },
          { path: "response.data.userInfo", value: response.data.userInfo },
          { path: "response.data.data.userInfo", value: response.data.data.userInfo },
          { path: "response.data.data.profile", value: response.data.data.profile }
        ];
        
        locations.forEach(loc => {
          if (loc.value) {
            console.log(`✅ Found user data at: ${loc.path}`, loc.value);
          } else {
            console.log(`❌ No data at: ${loc.path}`);
          }
        });
      }
    } else {
      console.log("❌ No response.data.data object");
    }
  } else {
    console.log("❌ No response.data");
  }
  
  // Check if backend is returning different structure
  if (response?.accessToken) {
    console.log("⚠️ Token found directly on response:", response.accessToken);
  }
  
  if (response?.user) {
    console.log("⚠️ User found directly on response:", response.user);
  }
};

// Test different login response formats
export const parseLoginResponse = (response) => {
  console.log("🔧 Attempting to parse login response...");
  
  // Try different possible structures
  const possibleStructures = [
    // Standard structure
    {
      name: "Standard: response.data.data",
      token: response?.data?.data?.accessToken,
      user: response?.data?.data?.user
    },
    // Alternative structures
    {
      name: "Alt 1: response.data",
      token: response?.data?.accessToken,
      user: response?.data?.user
    },
    {
      name: "Alt 2: direct response", 
      token: response?.accessToken,
      user: response?.user
    },
    {
      name: "Alt 3: nested data",
      token: response?.data?.token,
      user: response?.data?.userInfo
    }
  ];
  
  for (const struct of possibleStructures) {
    console.log(`Testing ${struct.name}:`);
    console.log(`  - Token: ${struct.token ? '✅ Found' : '❌ Missing'}`);
    console.log(`  - User: ${struct.user ? '✅ Found' : '❌ Missing'}`);
    
    if (struct.token && struct.user) {
      console.log(`✅ SUCCESS: Using ${struct.name}`);
      return {
        token: struct.token,
        user: struct.user,
        source: struct.name
      };
    }
  }
  
  // If no user but token exists, return token only
  for (const struct of possibleStructures) {
    if (struct.token) {
      console.log(`⚠️ PARTIAL: Using ${struct.name} (token only)`);
      return {
        token: struct.token,
        user: null,
        source: struct.name + " (token only)"
      };
    }
  }
  
  console.log("❌ FAILED: No valid structure found");
  return null;
};