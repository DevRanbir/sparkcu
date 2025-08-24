import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getUserData, isAdminLoggedIn, getAdminSession } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [adminSession, setAdminSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for admin session
    const checkAdminSession = () => {
      const adminData = isAdminLoggedIn();
      setAdminSession(adminData);
    };

    // Check admin session on mount and periodically
    checkAdminSession();
    const adminInterval = setInterval(checkAdminSession, 5000); // Check every 5 seconds

    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch additional user data from Firestore
        const result = await getUserData(user.uid);
        if (result.success) {
          setUserData(result.data);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearInterval(adminInterval);
    };
  }, []);

  const value = {
    currentUser,
    userData,
    adminSession,
    isAdmin: !!adminSession,
    isLoggedIn: !!currentUser,
    isAdminLoggedIn: !!adminSession,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
