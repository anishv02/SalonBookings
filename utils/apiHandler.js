// utils/apiHandler.js

const BASE_URL = "http://10.0.2.2:3000"; // Use '10.0.2.2' for Android emulator (or 'localhost' for iOS)

const apiHandler = async (endpoint, method = "GET", data = null) => {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const json = await response.json();

    if (!response.ok) throw new Error(json.message || "API error");

    return { data: json, success: true };
  } catch (error) {
    console.error("API Error:", error.message);
    return { data: null, success: false, error: error.message };
  }
};

export default apiHandler;
