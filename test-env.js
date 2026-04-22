// Test script to check environment variable
// Run this in browser console on your website

console.log("=== Environment Variable Test ===");
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("typeof:", typeof process.env.NEXT_PUBLIC_API_URL);

// Test API call
async function testAPI() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log("Testing API URL:", apiUrl);
  
  if (!apiUrl) {
    console.error("❌ API URL is undefined!");
    return;
  }
  
  try {
    const response = await fetch(apiUrl);
    console.log("✅ Response status:", response.status);
    console.log("✅ Response headers:", [...response.headers.entries()]);
    
    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log("✅ Data received:", data);
    console.log("✅ Number of records:", data.length);
    
  } catch (error) {
    console.error("❌ Fetch error:", error);
  }
}

// Run test
testAPI();
