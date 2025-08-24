import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, getUserTeamData, isAdminLoggedIn, getAdminSession, checkLoginPersistence, setupSessionManagement } from '../services/firebase';

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
    const adminInterval = setInterval(checkAdminSession, 1000); // Check every 1 second for more responsive updates

    // Setup session management for handling browser close/refresh
    const cleanupSessionManagement = setupSessionManagement();

    // Check if user should stay logged in based on remember me setting
    const initializeAuth = async () => {
      await checkLoginPersistence();
      
      const unsubscribe = onAuthStateChange(async (user) => {
        if (user && user.emailVerified) {
          // Only set user data if email is verified
          setCurrentUser(user);
          // Fetch additional user data from Firestore with current verification status
          const result = await getUserTeamData();
          if (result.success) {
            setUserData(result.teamData);
          }
        } else {
          // If user is not verified or no user, clear state
          setCurrentUser(null);
          setUserData(null);
          // Clear remember login flag when user logs out
          localStorage.removeItem('rememberLogin');
          sessionStorage.removeItem('loginSession');
        }
        setLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribe;
    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(adminInterval);
      cleanupSessionManagement();
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
