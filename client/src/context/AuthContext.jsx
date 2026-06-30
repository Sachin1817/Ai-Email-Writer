import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  googleProvider, 
  isFirebaseEnabled, 
  signInWithPopup, 
  signOut 
} from "../services/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated login/logout for fallback mode
  const loginSimulated = () => {
    const mockUser = {
      uid: "mock-user-123",
      displayName: "James Dalton",
      email: "james.dalton@example.com",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      isMock: true
    };
    localStorage.setItem("mock_user", JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  };

  const logoutSimulated = () => {
    localStorage.removeItem("mock_user");
    setUser(null);
  };

  useEffect(() => {
    if (isFirebaseEnabled) {
      const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "User",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
            isMock: false,
            getIdToken: () => firebaseUser.getIdToken()
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local development fallback
      const cached = localStorage.getItem("mock_user");
      if (cached) {
        setUser(JSON.parse(cached));
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseEnabled) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (error) {
        console.error("Firebase Login Error:", error);
        throw error;
      }
    } else {
      return loginSimulated();
    }
  };

  const logout = async () => {
    if (isFirebaseEnabled) {
      await signOut(auth);
    } else {
      logoutSimulated();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, isFirebaseEnabled }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
