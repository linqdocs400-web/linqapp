// Simple API test script - run this in browser console
// Copy and paste this into your browser's developer console on your website

async function testAPI() {
  console.log("=== API Debug Test ===");
  
  try {
    // Get the API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("1. API URL from env:", apiUrl);
    
    if (!apiUrl) {
      console.error("ERROR: NEXT_PUBLIC_API_URL is not defined!");
      return;
    }
    
    console.log("2. Testing API connection...");
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("3. Response status:", response.status);
    console.log("4. Response headers:", [...response.headers.entries()]);
    
    if (!response.ok) {
      console.error("ERROR: HTTP", response.status);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return;
    }
    
    const data = await response.json();
    console.log("5. Success! Data received:", data);
    console.log("6. Number of records:", data.length);
    
    if (data.length > 0) {
      console.log("7. Sample record:", data[0]);
      console.log("8. College/Office field present:", 'college_office' in data[0]);
    }
    
  } catch (error) {
    console.error("CATCH ERROR:", error);
  }
}

// Run the test
testAPI();
