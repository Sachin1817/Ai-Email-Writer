import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 60000, // 60 seconds (for long running AI requests)
});

// Request Interceptor to add Firebase Auth Token (or local mock flag)
API.interceptors.request.use(
  async (config) => {
    // We check local storage or session for user tokens
    const cachedUser = localStorage.getItem("mock_user");
    
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      if (parsed.isMock) {
        config.headers["X-Mock-User-Id"] = parsed.uid;
        config.headers["X-Mock-User-Email"] = parsed.email;
        config.headers["X-Mock-User-Name"] = parsed.displayName;
      }
    }
    
    // Attempt to fetch current Firebase session token if available
    try {
      const { auth, isFirebaseEnabled } = await import("./firebase");
      if (isFirebaseEnabled && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignored if firebase module is not loaded or not initialized yet
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
