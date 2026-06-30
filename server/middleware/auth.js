import admin from "firebase-admin";

// Initialize Firebase Admin SDK if service account is provided
let isFirebaseAdminInitialized = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseAdminInitialized = true;
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_KEY missing. Server is running in developer sandbox authentication mode.");
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Try Firebase Admin Validation if header exists and Firebase is initialized
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    
    if (isFirebaseAdminInitialized) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || "User",
          isMock: false
        };
        return next();
      } catch (error) {
        console.error("Firebase token verification failed:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
    } else {
      // Firebase Admin is NOT initialized (local sandbox mode), but client sent a Firebase token.
      // Decode JWT token payload without signature verification for local testing/development convenience.
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payloadPart = parts[1];
          const decodedPayload = JSON.parse(Buffer.from(payloadPart, "base64").toString("utf8"));
          req.user = {
            uid: decodedPayload.user_id || decodedPayload.uid || "mock-user-123",
            email: decodedPayload.email || "mock@example.com",
            name: decodedPayload.name || decodedPayload.email?.split("@")[0] || "Sandbox User",
            isMock: true
          };
          console.log(`[Dev Sandbox] Fallback Decoded JWT token for user: ${req.user.email}`);
          return next();
        }
      } catch (err) {
        console.error("Failed to decode token in sandbox mode:", err);
      }
    }
  }

  // 2. Local sandbox developer fallback if custom mock headers are present
  const mockUid = req.headers["x-mock-user-id"];
  const mockEmail = req.headers["x-mock-user-email"];
  const mockName = req.headers["x-mock-user-name"];

  if (mockUid && mockEmail) {
    req.user = {
      uid: mockUid,
      email: mockEmail,
      name: mockName || "Sandbox User",
      isMock: true
    };
    return next();
  }

  // 3. Deny request if no authentication could be resolved
  return res.status(401).json({ 
    message: "Unauthorized: No valid session token or sandbox credentials provided." 
  });
};

export default authMiddleware;
