// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject
} from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_lIpB7ScErML9_Hlx6wfNl8nbgLdw6bs",
  authDomain: "cuspark2025.firebaseapp.com",
  projectId: "cuspark2025",
  storageBucket: "cuspark2025.firebasestorage.app",
  messagingSenderId: "11642595818",
  appId: "1:11642595818:web:5ed31a8153c98a898caa93",
  measurementId: "G-NRPTXVV6DD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services
export { auth, db, analytics, storage };

// Check if team name already exists
export const checkTeamNameExists = async (teamName) => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamName));
    return teamDoc.exists();
  } catch (error) {
    console.error('Error checking team name:', error);
    return false;
  }
};

// Authentication functions
export const registerUser = async (email, password, userData) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with team leader name
    await updateProfile(user, {
      displayName: userData.leaderName
    });

    // Send email verification
    await sendEmailVerification(user);

    // Prepare members array with leader as first member
    const allMembers = [
      {
        name: userData.leaderName,
        uid: userData.leaderUid || '',
        mobile: userData.leaderMobile || '',
        email: email,
        status: 'leader',
        firebaseUid: user.uid
      },
      ...userData.members.map(member => ({
        ...member,
        status: 'member'
      }))
    ];

    // Save team data to Firestore using team name as document ID
    await setDoc(doc(db, 'teams', userData.teamName), {
      teamName: userData.teamName,
      leaderName: userData.leaderName,
      leaderEmail: email,
      leaderFirebaseUid: user.uid,
      academicYear: userData.academicYear,
      topicName: userData.topicName,
      members: allMembers,
      createdAt: serverTimestamp(),
      registrationComplete: true
    });

    return {
      success: true,
      user: user,
      message: 'Registration successful! Please check your email for verification.'
    };
  } catch (error) {
    console.error('Registration error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    
    // Handle specific error cases that might not have error.code
    let errorCode = error.code || 'unknown-error';
    
    return {
      success: false,
      error: errorCode,
      message: getErrorMessage(errorCode)
    };
  }
};

export const loginUser = async (email, password, rememberMe = false) => {
  try {
    // Set persistence based on remember me option
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Force reload user to get current verification status
    await user.reload();

    // Check if email is verified after reload
    if (!user.emailVerified) {
      // Sign out the user since they're not verified
      await signOut(auth);
      // Clear any stored sessions
      localStorage.removeItem('rememberLogin');
      sessionStorage.removeItem('loginSession');
      return {
        success: false,
        error: 'email-not-verified',
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        needsVerification: true,
        email: email
      };
    }

    // Store remember me preference and login timestamp
    if (rememberMe) {
      localStorage.setItem('rememberLogin', 'true');
    } else {
      localStorage.removeItem('rememberLogin');
      // For session-only login, store a timestamp to check on refresh
      sessionStorage.setItem('loginSession', Date.now().toString());
    }

    // Find the team where this user is the leader and update last login activity
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('leaderFirebaseUid', '==', user.uid));
    const querySnapshot = await getDocs(q);

    let userData = null;
    if (!querySnapshot.empty) {
      // Get the first (should be only) matching team
      const teamDoc = querySnapshot.docs[0];
      userData = teamDoc.data();
      
      // Update last login activity to track verification status
      await updateDoc(doc(db, 'teams', teamDoc.id), {
        lastLoginActivity: serverTimestamp()
      });
    }

    return {
      success: true,
      user: user,
      userData: userData,
      message: 'Login successful!'
    };
  } catch (error) {
    console.error('Login error details:', {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Handle specific error cases that might not have error.code
    let errorCode = error.code;
    let errorMessage = error.message;
    
    if (!errorCode) {
      // If there's no error code, try to determine from the message
      if (errorMessage && errorMessage.includes('network')) {
        errorCode = 'auth/network-request-failed';
      } else if (errorMessage && errorMessage.includes('timeout')) {
        errorCode = 'auth/timeout';
      } else {
        errorCode = 'unknown-error';
      }
    }
    
    return {
      success: false,
      error: errorCode,
      message: getErrorMessage(errorCode)
    };
  }
};

// Password reset function
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.'
    };
  } catch (error) {
    console.error('Password reset error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    
    let errorCode = error.code || 'unknown-error';
    
    return {
      success: false,
      error: errorCode,
      message: getErrorMessage(errorCode)
    };
  }
};

// Resend email verification function
export const resendEmailVerification = async (email, password) => {
  try {
    // Sign in temporarily to resend verification
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (user.emailVerified) {
      return {
        success: false,
        message: 'Email is already verified. You can login now.'
      };
    }
    
    await sendEmailVerification(user);
    // Sign out after sending verification
    await signOut(auth);
    
    return {
      success: true,
      message: 'Verification email sent! Please check your inbox and verify your email before logging in.'
    };
  } catch (error) {
    console.error('Resend verification error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    
    let errorCode = error.code || 'unknown-error';
    
    return {
      success: false,
      error: errorCode,
      message: getErrorMessage(errorCode)
    };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Check if user should stay logged in based on remember me setting
export const checkLoginPersistence = async () => {
  const isRemembered = localStorage.getItem('rememberLogin') === 'true';
  const loginSession = sessionStorage.getItem('loginSession');
  
  // If user didn't check remember me and there's no active session, sign them out
  if (!isRemembered && !loginSession) {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await signOut(auth);
        localStorage.removeItem('rememberLogin');
        sessionStorage.removeItem('loginSession');
      }
    } catch (error) {
      console.error('Error signing out user:', error);
    }
  } else {
    // Also check if user is verified, if not and they're trying to persist, sign them out
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      try {
        await signOut(auth);
        localStorage.removeItem('rememberLogin');
        sessionStorage.removeItem('loginSession');
      } catch (error) {
        console.error('Error signing out unverified user:', error);
      }
    }
  }
};

// Setup session management for non-remembered logins
export const setupSessionManagement = () => {
  const handleBeforeUnload = () => {
    const isRemembered = localStorage.getItem('rememberLogin') === 'true';
    if (!isRemembered) {
      // Clear session data when browser is closed/refreshed and remember me is not checked
      sessionStorage.removeItem('loginSession');
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    // Clear remember login flag and session to ensure clean logout
    localStorage.removeItem('rememberLogin');
    sessionStorage.removeItem('loginSession');
    return {
      success: true,
      message: 'Logged out successfully!'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error logging out. Please try again.'
    };
  }
};

export const getUserData = async (uid) => {
  try {
    // Find the team where this user is the leader
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('leaderFirebaseUid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return {
        success: true,
        data: querySnapshot.docs[0].data()
      };
    } else {
      return {
        success: false,
        message: 'User data not found'
      };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching user data'
    };
  }
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  console.log('Error code received:', errorCode); // Debug logging
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please use a different email or try logging in.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your email or register.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/timeout':
      return 'Request timed out. Please check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Authentication was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Authentication request was cancelled. Please try again.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    case 'auth/invalid-api-key':
      return 'Configuration error. Please contact support.';
    case 'auth/app-not-authorized':
      return 'Application not authorized. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Please contact support.';
    case 'email-not-verified':
      return 'Please verify your email address before logging in. Check your inbox for the verification link.';
    case 'permission-denied':
      return 'Access denied. Please check your permissions.';
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again later.';
    case 'not-found':
      return 'Requested resource not found.';
    case 'unknown-error':
      return 'An unexpected error occurred. Please try again or contact support.';
    case null:
    case undefined:
    case '':
      return 'An unknown error occurred. Please try again or contact support.';
    default:
      console.warn('Unhandled error code:', errorCode); // Log unhandled errors
      return `Authentication failed${errorCode ? ` (${errorCode})` : ''}. Please try again or contact support if the problem persists.`;
  }
};

// Create default admin (run this once to setup)
export const createDefaultAdmin = async () => {
  try {
    const defaultAdminId = 'admin';
    const defaultPassword = 'admin123'; // Change this to a secure password
    
    // Check if admin already exists
    const adminDoc = await getDoc(doc(db, 'admins', defaultAdminId));
    
    if (adminDoc.exists()) {
      return {
        success: false,
        message: 'Default admin already exists'
      };
    }
    
    // Create default admin
    await setDoc(doc(db, 'admins', defaultAdminId), {
      adminId: defaultAdminId,
      password: defaultPassword, // In production, hash this password
      role: 'superadmin',
      name: 'System Administrator',
      email: 'admin@sparkcu.com',
      createdAt: serverTimestamp(),
      isActive: true,
      permissions: {
        manageTeams: true,
        manageUsers: true,
        systemSettings: true,
        viewAnalytics: true
      }
    });
    
    return {
      success: true,
      message: 'Default admin created successfully',
      credentials: {
        adminId: defaultAdminId,
        password: defaultPassword
      }
    };
  } catch (error) {
    console.error('Error creating default admin:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error creating default admin'
    };
  }
};

// Admin authentication
export const loginAdmin = async (adminId, password) => {
  try {
    // Check admin credentials from Firestore
    const adminDoc = await getDoc(doc(db, 'admins', adminId));
    
    if (!adminDoc.exists()) {
      return {
        success: false,
        message: 'Invalid admin credentials'
      };
    }
    
    const adminData = adminDoc.data();
    
    // Simple password check (in production, use proper hashing)
    if (adminData.password === password && adminData.isActive) {
      // Store admin session in localStorage
      localStorage.setItem('adminSession', JSON.stringify({
        adminId: adminId,
        loginTime: Date.now(),
        role: adminData.role || 'admin',
        name: adminData.name,
        permissions: adminData.permissions
      }));
      
      return {
        success: true,
        admin: adminData,
        message: 'Admin login successful!'
      };
    } else {
      return {
        success: false,
        message: 'Invalid admin credentials'
      };
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error during admin login'
    };
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminSession');
  return {
    success: true,
    message: 'Admin logged out successfully!'
  };
};

export const isAdminLoggedIn = () => {
  const adminSession = localStorage.getItem('adminSession');
  if (!adminSession) return false;
  
  try {
    const session = JSON.parse(adminSession);
    // Check if session is less than 24 hours old
    const isValid = (Date.now() - session.loginTime) < (24 * 60 * 60 * 1000);
    if (!isValid) {
      localStorage.removeItem('adminSession');
      return false;
    }
    return session;
  } catch {
    localStorage.removeItem('adminSession');
    return false;
  }
};

export const getAdminSession = () => {
  const adminSession = localStorage.getItem('adminSession');
  if (!adminSession) return null;
  
  try {
    return JSON.parse(adminSession);
  } catch {
    return null;
  }
};

// Get current user's team data with their actual email verification status
export const getUserTeamData = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'No user logged in'
      };
    }

    // Find the team where this user is the leader
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('leaderFirebaseUid', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        message: 'No team found for current user'
      };
    }

    const teamData = querySnapshot.docs[0].data();
    
    // Add the actual email verification status from Firebase Auth
    return {
      success: true,
      teamData: {
        ...teamData,
        emailVerified: currentUser.emailVerified
      }
    };
  } catch (error) {
    console.error('Error fetching user team data:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching team data'
    };
  }
};

// Refresh current user's email verification status
export const refreshUserVerificationStatus = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'No user logged in'
      };
    }

    // Reload the user to get the latest verification status
    await currentUser.reload();
    
    return {
      success: true,
      emailVerified: currentUser.emailVerified,
      message: currentUser.emailVerified ? 'Email is verified!' : 'Email verification still pending'
    };
  } catch (error) {
    console.error('Error refreshing verification status:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error checking verification status'
    };
  }
};

// Fetch all teams for admin
export const getAllTeams = async () => {
  try {
    const teamsRef = collection(db, 'teams');
    const querySnapshot = await getDocs(teamsRef);
    
    const teams = [];
    const currentUser = auth.currentUser;
    
    for (const docSnap of querySnapshot.docs) {
      const teamData = docSnap.data();
      let emailVerified = false;
      
      // If the current user is the leader of this team, get their actual verification status
      if (currentUser && teamData.leaderFirebaseUid === currentUser.uid) {
        emailVerified = currentUser.emailVerified;
      } else {
        // For other teams, we need to infer verification status from their activity
        // Since users can only log in if they're verified (due to our login checks)
        
        // Check if team has any recent successful activity that indicates verification
        const hasSubmissionActivity = teamData.submissionLinks && teamData.submissionLinks.lastUpdated;
        const hasRecentLogin = teamData.lastLoginActivity && 
          (new Date() - (teamData.lastLoginActivity.toDate ? teamData.lastLoginActivity.toDate() : new Date(teamData.lastLoginActivity))) < (30 * 24 * 60 * 60 * 1000); // 30 days
        
        // If they've submitted something or logged in recently, they must be verified
        // This is a reasonable assumption since our login system requires verification
        emailVerified = hasSubmissionActivity || hasRecentLogin || false;
        
        // For very recent registrations (within last hour), assume pending unless proven verified
        if (teamData.createdAt) {
          const registrationTime = teamData.createdAt.toDate ? teamData.createdAt.toDate() : new Date(teamData.createdAt);
          const hoursSinceRegistration = (new Date() - registrationTime) / (1000 * 60 * 60);
          
          if (hoursSinceRegistration < 1 && !hasSubmissionActivity && !hasRecentLogin) {
            emailVerified = false; // Very recent registration, likely not verified yet
          }
        }
      }
      
      teams.push({
        id: docSnap.id,
        ...teamData,
        emailVerified: emailVerified
      });
    }
    
    return {
      success: true,
      teams: teams,
      count: teams.length
    };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching teams data'
    };
  }
};

// Schedule management functions
export const getScheduleData = async () => {
  try {
    const scheduleRef = collection(db, 'schedule');
    const q = query(scheduleRef, orderBy('timeOrder', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const scheduleData = [];
    querySnapshot.forEach((doc) => {
      scheduleData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      data: scheduleData
    };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching schedule data'
    };
  }
};

// Countdown management functions
export const getCountdownData = async () => {
  try {
    const countdownRef = doc(db, 'settings', 'countdown');
    const docSnap = await getDoc(countdownRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data()
      };
    } else {
      // Return default countdown data if none exists
      return {
        success: true,
        data: {
          targetDate: '',
          title: 'SparkCU Ideathon 2024',
          description: 'Event starts in'
        }
      };
    }
  } catch (error) {
    console.error('Error fetching countdown:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching countdown data'
    };
  }
};

export const updateCountdownData = async (countdownData) => {
  try {
    const countdownRef = doc(db, 'settings', 'countdown');
    await setDoc(countdownRef, {
      ...countdownData,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Countdown updated successfully'
    };
  } catch (error) {
    console.error('Error updating countdown:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating countdown'
    };
  }
};

export const addScheduleItem = async (itemData) => {
  try {
    const scheduleRef = collection(db, 'schedule');
    await addDoc(scheduleRef, {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Schedule item added successfully'
    };
  } catch (error) {
    console.error('Error adding schedule item:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error adding schedule item'
    };
  }
};

export const updateScheduleItem = async (itemId, itemData) => {
  try {
    const itemRef = doc(db, 'schedule', itemId);
    await updateDoc(itemRef, {
      ...itemData,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Schedule item updated successfully'
    };
  } catch (error) {
    console.error('Error updating schedule item:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating schedule item'
    };
  }
};

export const deleteScheduleItem = async (itemId) => {
  try {
    const itemRef = doc(db, 'schedule', itemId);
    await deleteDoc(itemRef);
    
    return {
      success: true,
      message: 'Schedule item deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error deleting schedule item'
    };
  }
};

export const clearScheduleData = async () => {
  try {
    const scheduleRef = collection(db, 'schedule');
    const querySnapshot = await getDocs(scheduleRef);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    return {
      success: true,
      message: 'All schedule data cleared successfully'
    };
  } catch (error) {
    console.error('Error clearing schedule data:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error clearing schedule data'
    };
  }
};

export const initializeScheduleData = async (defaultData) => {
  try {
    const scheduleRef = collection(db, 'schedule');
    
    const addPromises = defaultData.map(item => 
      addDoc(scheduleRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(addPromises);
    
    return {
      success: true,
      message: 'Schedule initialized successfully'
    };
  } catch (error) {
    console.error('Error initializing schedule:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error initializing schedule'
    };
  }
};

// ========== ANNOUNCEMENTS FUNCTIONS ==========

// Get all announcements
export const getAnnouncements = async () => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      announcements: announcements
    };
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching announcements'
    };
  }
};

// Add new announcement
export const addAnnouncement = async (announcementData) => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const docRef = await addDoc(announcementsRef, {
      ...announcementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      id: docRef.id,
      message: 'Announcement added successfully'
    };
  } catch (error) {
    console.error('Error adding announcement:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error adding announcement'
    };
  }
};

// Update announcement
export const updateAnnouncement = async (id, announcementData) => {
  try {
    const announcementRef = doc(db, 'announcements', id);
    await updateDoc(announcementRef, {
      ...announcementData,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Announcement updated successfully'
    };
  } catch (error) {
    console.error('Error updating announcement:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating announcement'
    };
  }
};

// Delete announcement
export const deleteAnnouncement = async (id) => {
  try {
    const announcementRef = doc(db, 'announcements', id);
    await deleteDoc(announcementRef);
    
    return {
      success: true,
      message: 'Announcement deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error deleting announcement'
    };
  }
};

// Get announcement by ID
export const getAnnouncementById = async (id) => {
  try {
    const announcementRef = doc(db, 'announcements', id);
    const docSnap = await getDoc(announcementRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        announcement: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      return {
        success: false,
        message: 'Announcement not found'
      };
    }
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching announcement'
    };
  }
};

// Create auto-announcement for schedule events
export const createAutoAnnouncement = async (scheduleEvent) => {
  try {
    // First check if auto-announcements are enabled
    const settingsResult = await getAutoAnnouncementSettings();
    if (!settingsResult.success || !settingsResult.settings.enabled) {
      return {
        success: false,
        message: 'Auto-announcements are disabled'
      };
    }

    // Create a more detailed announcement message
    let announcementTitle = `🎯 ${scheduleEvent.event} - Now Live!`;
    let announcementMessage = `${scheduleEvent.event} has started at ${scheduleEvent.time}! `;
    
    if (scheduleEvent.description && scheduleEvent.description.trim()) {
      announcementMessage += `${scheduleEvent.description} `;
    }
    
    // Add type-specific messages
    if (scheduleEvent.type === 'break') {
      announcementTitle = `☕ Break Time - ${scheduleEvent.event}`;
      announcementMessage += `Take a break and get ready for what's coming next!`;
    } else if (scheduleEvent.type === 'event') {
      announcementTitle = `🚀 ${scheduleEvent.event} - Started!`;
      announcementMessage += `Don't miss out on this exciting event!`;
    } else if (scheduleEvent.type === 'ceremony') {
      announcementTitle = `🎉 ${scheduleEvent.event} - Begins Now!`;
      announcementMessage += `Join us for this special ceremony!`;
    } else {
      announcementMessage += `Check the schedule for more details.`;
    }

    const autoAnnouncementData = {
      title: announcementTitle,
      message: announcementMessage,
      type: 'event',
      isAutoGenerated: true,
      scheduleEventId: scheduleEvent.id,
      originalEventTime: scheduleEvent.time,
      createdAt: serverTimestamp()
    };

    return await addAnnouncement(autoAnnouncementData);
  } catch (error) {
    console.error('Error creating auto-announcement:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error creating auto-announcement'
    };
  }
};

// Check and create auto-announcements for due schedule events
export const checkAndCreateAutoAnnouncements = async () => {
  try {
    const settingsResult = await getAutoAnnouncementSettings();
    if (!settingsResult.success || !settingsResult.settings.enabled) {
      return {
        success: false,
        message: 'Auto-announcements are disabled'
      };
    }

    const scheduleResult = await getScheduleData();
    if (!scheduleResult.success) {
      return {
        success: false,
        message: 'Failed to fetch schedule data'
      };
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format
    const createdAnnouncements = [];

    for (const event of scheduleResult.data) {
      // Compare only the time part (HH:MM)
      const eventTime = event.time; // Should be in HH:MM format
      
      // Check if current time matches event time (within 1 minute tolerance)
      const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
      const eventMinutes = parseInt(eventTime.split(':')[0]) * 60 + parseInt(eventTime.split(':')[1]);
      const timeDiff = Math.abs(currentMinutes - eventMinutes);
      
      // Check if we're within 2 minutes of the event time
      if (timeDiff <= 2) {
        // Create a unique identifier for this event (combining event details + today's date)
        const today = now.toDateString();
        const eventUniqueId = `${event.id}_${today}`;
        
        // Check if we already created an auto-announcement for this event today
        const existingAnnouncements = await getAnnouncements();
        const hasAutoAnnouncement = existingAnnouncements.announcements?.some(
          ann => ann.isAutoGenerated && ann.scheduleEventId === eventUniqueId
        );

        if (!hasAutoAnnouncement) {
          // Create event with unique ID for today
          const eventWithUniqueId = {
            ...event,
            id: eventUniqueId
          };
          
          const result = await createAutoAnnouncement(eventWithUniqueId);
          if (result.success) {
            createdAnnouncements.push(event.event);
            console.log(`Created auto-announcement for: ${event.event} at ${eventTime}`);
          }
        }
      }
    }

    return {
      success: true,
      createdCount: createdAnnouncements.length,
      announcements: createdAnnouncements,
      message: `Created ${createdAnnouncements.length} auto-announcements`
    };
  } catch (error) {
    console.error('Error checking auto-announcements:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error checking auto-announcements'
    };
  }
};

// ========== TEAM SUBMISSION FUNCTIONS ==========

// Update team submission links
export const updateTeamSubmission = async (userId, submissionData) => {
  try {
    // Find the team where this user is the leader
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('leaderFirebaseUid', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        message: 'Team not found for this user'
      };
    }

    const teamDoc = querySnapshot.docs[0];
    const teamRef = doc(db, 'teams', teamDoc.id);
    
    await updateDoc(teamRef, {
      submissionLinks: {
        ...submissionData,
        lastUpdated: serverTimestamp()
      }
    });

    return {
      success: true,
      message: 'Submission links updated successfully'
    };
  } catch (error) {
    console.error('Error updating submission:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating submission links'
    };
  }
};

// Get team submission links
export const getTeamSubmission = async (userId) => {
  try {
    // Find the team where this user is the leader
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('leaderFirebaseUid', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        message: 'Team not found for this user'
      };
    }

    const teamData = querySnapshot.docs[0].data();
    
    return {
      success: true,
      submissionLinks: teamData.submissionLinks || null
    };
  } catch (error) {
    console.error('Error fetching submission:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching submission links'
    };
  }
};

// Update team topic name
export const updateTeamTopicName = async (userId, topicName) => {
  try {
    // Find the team where this user is the leader
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('leaderFirebaseUid', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        message: 'Team not found for this user'
      };
    }

    const teamDoc = querySnapshot.docs[0];
    const teamRef = doc(db, 'teams', teamDoc.id);
    
    await updateDoc(teamRef, {
      topicName: topicName,
      topicUpdatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Topic name updated successfully'
    };
  } catch (error) {
    console.error('Error updating topic name:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating topic name'
    };
  }
};

// Get team data by user ID
export const getTeamByUserId = async (userId) => {
  try {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('leaderFirebaseUid', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        message: 'Team not found for this user'
      };
    }

    const teamData = querySnapshot.docs[0].data();
    
    return {
      success: true,
      teamData: {
        id: querySnapshot.docs[0].id,
        ...teamData
      }
    };
  } catch (error) {
    console.error('Error fetching team data:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching team data'
    };
  }
};

// Gallery management functions
export const getGalleryData = async () => {
  try {
    const galleryRef = doc(db, 'settings', 'gallery');
    const docSnap = await getDoc(galleryRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data()
      };
    } else {
      // Return default gallery data if none exists
      return {
        success: true,
        data: {
          driveLink: 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID',
          linkTitle: 'View More Photos',
          linkDescription: 'Access our complete photo collection on Google Drive'
        }
      };
    }
  } catch (error) {
    console.error('Error fetching gallery data:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching gallery data'
    };
  }
};

export const updateGalleryData = async (galleryData) => {
  try {
    const galleryRef = doc(db, 'settings', 'gallery');
    await setDoc(galleryRef, {
      ...galleryData,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Gallery settings updated successfully'
    };
  } catch (error) {
    console.error('Error updating gallery data:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating gallery settings'
    };
  }
};

// Dome Gallery Images management functions
export const getDomeGalleryImages = async () => {
  try {
    const domeGalleryRef = doc(db, 'settings', 'domeGallery');
    const docSnap = await getDoc(domeGalleryRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data()
      };
    } else {
      // Return empty data if no configuration exists
      return {
        success: true,
        data: {
          images: []
        }
      };
    }
  } catch (error) {
    console.error('Error fetching dome gallery images:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching dome gallery images'
    };
  }
};

export const updateDomeGalleryImages = async (imagesData) => {
  try {
    const domeGalleryRef = doc(db, 'settings', 'domeGallery');
    await setDoc(domeGalleryRef, {
      images: imagesData,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Dome gallery images updated successfully'
    };
  } catch (error) {
    console.error('Error updating dome gallery images:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating dome gallery images'
    };
  }
};

// Firebase Storage functions for dome gallery images
export const uploadDomeGalleryImage = async (file, fileName) => {
  try {
    const storageRef = ref(storage, `dome-gallery/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      message: 'Image uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error uploading image'
    };
  }
};

export const getStoredDomeGalleryImages = async () => {
  try {
    const storageRef = ref(storage, 'dome-gallery');
    const result = await listAll(storageRef);
    
    const imagePromises = result.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      const name = itemRef.name;
      return {
        src: url,
        alt: name.replace(/\.[^/.]+$/, ""), // Remove file extension for alt text
        fileName: name,
        isFromStorage: true
      };
    });
    
    const images = await Promise.all(imagePromises);
    
    return {
      success: true,
      images: images,
      message: 'Images retrieved successfully'
    };
  } catch (error) {
    console.error('Error getting stored images:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error retrieving stored images',
      images: []
    };
  }
};

export const deleteStoredDomeGalleryImage = async (fileName) => {
  try {
    const storageRef = ref(storage, `dome-gallery/${fileName}`);
    await deleteObject(storageRef);
    
    return {
      success: true,
      message: 'Image deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error deleting image'
    };
  }
};

// Page Visibility Management Functions
export const getPageVisibilitySettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'pageVisibility');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: 'Page visibility settings retrieved successfully'
      };
    } else {
      // Return default settings if none exist
      const defaultSettings = {
        home: true,
        rules: true,
        schedule: true,
        about: true,
        keymaps: true,
        prizes: true,
        gallery: true,
        result: true,
        dashboard: true, // Always visible for logged-in users
        login: true,
        register: true
      };
      
      return {
        success: true,
        data: defaultSettings,
        message: 'Default page visibility settings returned'
      };
    }
  } catch (error) {
    console.error('Error getting page visibility settings:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error retrieving page visibility settings'
    };
  }
};

export const updatePageVisibilitySettings = async (settings) => {
  try {
    const docRef = doc(db, 'settings', 'pageVisibility');
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return {
      success: true,
      message: 'Page visibility settings updated successfully'
    };
  } catch (error) {
    console.error('Error updating page visibility settings:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating page visibility settings'
    };
  }
};

// ========== SUBMISSION SETTINGS FUNCTIONS ==========

// Get submission settings
export const getSubmissionSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'submissions');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure consistent field naming
      const settings = {
        enabled: data.enabled !== undefined ? data.enabled : data.submissionEnabled !== undefined ? data.submissionEnabled : true,
        message: data.message || 'Submissions are currently open',
        updatedAt: data.updatedAt
      };
      return {
        success: true,
        settings: settings,
        message: 'Submission settings retrieved successfully'
      };
    } else {
      // Return default settings if none exist
      const defaultSettings = {
        enabled: true,
        message: 'Submissions are currently open',
        updatedAt: new Date()
      };
      return {
        success: true,
        settings: defaultSettings,
        message: 'Default submission settings returned'
      };
    }
  } catch (error) {
    console.error('Error getting submission settings:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error retrieving submission settings'
    };
  }
};

// Update submission settings
export const updateSubmissionSettings = async (settings) => {
  try {
    const docRef = doc(db, 'settings', 'submissions');
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return {
      success: true,
      message: 'Submission settings updated successfully'
    };
  } catch (error) {
    console.error('Error updating submission settings:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating submission settings'
    };
  }
};

// ========== AUTO ANNOUNCEMENT SETTINGS FUNCTIONS ==========

// Get auto announcement settings
export const getAutoAnnouncementSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'autoAnnouncements');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure consistent field naming
      const settings = {
        enabled: data.enabled !== undefined ? data.enabled : true,
        message: data.message || 'Auto-announcements for schedule events',
        updatedAt: data.updatedAt
      };
      return {
        success: true,
        settings: settings,
        message: 'Auto announcement settings retrieved successfully'
      };
    } else {
      // Return default settings if none exist
      const defaultSettings = {
        enabled: true,
        message: 'Auto-announcements for schedule events',
        updatedAt: new Date()
      };
      return {
        success: true,
        settings: defaultSettings,
        message: 'Default auto announcement settings returned'
      };
    }
  } catch (error) {
    console.error('Error getting auto announcement settings:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error retrieving auto announcement settings'
    };
  }
};

// Update auto announcement settings
export const updateAutoAnnouncementSettings = async (settings) => {
  try {
    const docRef = doc(db, 'settings', 'autoAnnouncements');
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return {
      success: true,
      message: 'Auto announcement settings updated successfully'
    };
  } catch (error) {
    console.error('Error updating auto announcement settings:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating auto announcement settings'
    };
  }
};

// Notification Management Functions - Updated to store in team documents
export const getNotifications = async () => {
  try {
    const teamsRef = collection(db, 'teams');
    const querySnapshot = await getDocs(teamsRef);
    
    const allNotifications = [];
    querySnapshot.forEach((doc) => {
      const teamData = doc.data();
      if (teamData.notifications && Array.isArray(teamData.notifications)) {
        teamData.notifications.forEach((notification, index) => {
          allNotifications.push({
            id: `${doc.id}_${index}`,
            teamId: doc.id,
            teamName: teamData.teamName,
            notificationIndex: index,
            ...notification
          });
        });
      }
    });
    
    // Sort by creation date descending
    allNotifications.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return {
      success: true,
      notifications: allNotifications
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching notifications'
    };
  }
};

export const addNotifications = async (notificationsData) => {
  try {
    const teamsRef = collection(db, 'teams');
    const querySnapshot = await getDocs(teamsRef);
    
    // Create a map of team names to team documents
    const teamMap = new Map();
    querySnapshot.forEach((doc) => {
      const teamData = doc.data();
      teamMap.set(teamData.teamName, {
        id: doc.id,
        data: teamData
      });
    });
    
    const updatePromises = [];
    let addedCount = 0;
    let notFoundTeams = [];
    const currentTime = new Date();
    
    for (const notification of notificationsData) {
      const team = teamMap.get(notification.teamName);
      if (team) {
        const teamRef = doc(db, 'teams', team.id);
        const existingNotifications = team.data.notifications || [];
        
        const newNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          notification: notification.notification,
          createdAt: notification.customTimestamp || currentTime,
          read: false,
          addedBy: 'admin'
        };
        
        const updatedNotifications = [...existingNotifications, newNotification];
        
        updatePromises.push(
          updateDoc(teamRef, {
            notifications: updatedNotifications,
            lastNotificationUpdate: serverTimestamp()
          })
        );
        addedCount++;
      } else {
        notFoundTeams.push(notification.teamName);
      }
    }
    
    await Promise.all(updatePromises);
    
    let message = `${addedCount} notifications added successfully`;
    if (notFoundTeams.length > 0) {
      message += `. Warning: ${notFoundTeams.length} team(s) not found: ${notFoundTeams.join(', ')}`;
    }
    
    return {
      success: true,
      message: message,
      addedCount: addedCount,
      notFoundTeams: notFoundTeams
    };
  } catch (error) {
    console.error('Error adding notifications:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error adding notifications'
    };
  }
};

export const updateNotifications = async (notificationUpdates) => {
  try {
    const teamsRef = collection(db, 'teams');
    const querySnapshot = await getDocs(teamsRef);
    
    // Create a map of team names to team documents
    const teamMap = new Map();
    querySnapshot.forEach((doc) => {
      const teamData = doc.data();
      teamMap.set(teamData.teamName, {
        id: doc.id,
        data: teamData
      });
    });
    
    const updatePromises = [];
    let updatedCount = 0;
    let notFoundTeams = [];
    let notFoundNotifications = [];
    
    for (const update of notificationUpdates) {
      const team = teamMap.get(update.teamName);
      if (team) {
        const teamRef = doc(db, 'teams', team.id);
        const existingNotifications = team.data.notifications || [];
        
        // Find the notification to update by ID
        const notificationIndex = existingNotifications.findIndex(notif => notif.id === update.notificationId);
        
        if (notificationIndex !== -1) {
          // Update the notification
          const updatedNotifications = [...existingNotifications];
          updatedNotifications[notificationIndex] = {
            ...updatedNotifications[notificationIndex],
            notification: update.newNotification,
            updatedAt: new Date(),
            updatedBy: 'admin'
          };
          
          updatePromises.push(
            updateDoc(teamRef, {
              notifications: updatedNotifications,
              lastNotificationUpdate: serverTimestamp()
            })
          );
          updatedCount++;
        } else {
          notFoundNotifications.push(`${update.teamName}:${update.notificationId}`);
        }
      } else {
        notFoundTeams.push(update.teamName);
      }
    }
    
    await Promise.all(updatePromises);
    
    let message = `${updatedCount} notifications updated successfully`;
    const errors = [];
    
    if (notFoundTeams.length > 0) {
      errors.push(`Teams not found: ${notFoundTeams.join(', ')}`);
    }
    if (notFoundNotifications.length > 0) {
      errors.push(`Notifications not found: ${notFoundNotifications.join(', ')}`);
    }
    
    return {
      success: true,
      message: message,
      updatedCount: updatedCount,
      errors: errors
    };
  } catch (error) {
    console.error('Error updating notifications:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating notifications',
      errors: [error.message]
    };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    console.log('deleteNotification called with ID:', notificationId);
    
    // Parse the notification ID to get team ID and notification index
    // Handle case where teamId might contain underscores
    const parts = notificationId.split('_');
    if (parts.length < 2) {
      console.error('Invalid notification ID format:', notificationId);
      return {
        success: false,
        message: 'Invalid notification ID format'
      };
    }
    
    // The last part is the index, everything before that is the teamId
    const notificationIndex = parseInt(parts[parts.length - 1]);
    const teamId = parts.slice(0, -1).join('_');
    
    console.log('Parsed teamId:', teamId, 'notificationIndex:', notificationIndex);
    
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      console.error('Team not found:', teamId);
      return {
        success: false,
        message: 'Team not found'
      };
    }
    
    const teamData = teamDoc.data();
    const notifications = teamData.notifications || [];
    
    console.log('Team notifications:', notifications.length, 'notifications found');
    
    if (isNaN(notificationIndex) || notificationIndex >= notifications.length || notificationIndex < 0) {
      console.error('Invalid notification index:', notificationIndex, 'max index:', notifications.length - 1);
      return {
        success: false,
        message: 'Notification not found'
      };
    }
    
    console.log('Deleting notification at index:', notificationIndex);
    
    // Remove the notification at the specified index
    const updatedNotifications = notifications.filter((_, index) => index !== notificationIndex);
    
    await updateDoc(teamRef, {
      notifications: updatedNotifications,
      lastNotificationUpdate: serverTimestamp()
    });
    
    console.log('Notification deleted successfully');
    
    return {
      success: true,
      message: 'Notification deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error deleting notification'
    };
  }
};

export const deleteAllNotifications = async () => {
  try {
    const teamsRef = collection(db, 'teams');
    const querySnapshot = await getDocs(teamsRef);
    
    const batch = writeBatch(db);
    let teamsUpdated = 0;
    
    querySnapshot.forEach((doc) => {
      const teamData = doc.data();
      if (teamData.notifications && teamData.notifications.length > 0) {
        batch.update(doc.ref, {
          notifications: [],
          lastNotificationUpdate: serverTimestamp()
        });
        teamsUpdated++;
      }
    });
    
    if (teamsUpdated > 0) {
      await batch.commit();
    }
    
    return {
      success: true,
      message: `All notifications deleted successfully from ${teamsUpdated} teams`
    };
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error deleting all notifications'
    };
  }
};

export const getUserNotifications = async (teamName) => {
  try {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('teamName', '==', teamName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: true,
        notifications: [],
        message: 'Team not found'
      };
    }
    
    const teamDoc = querySnapshot.docs[0];
    const teamData = teamDoc.data();
    const notifications = teamData.notifications || [];
    
    // Add IDs and sort by creation date descending
    const notificationsWithIds = notifications.map((notification, index) => ({
      id: `${teamDoc.id}_${index}`,
      teamId: teamDoc.id,
      teamName: teamData.teamName,
      notificationIndex: index,
      ...notification
    }));
    
    notificationsWithIds.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return {
      success: true,
      notifications: notificationsWithIds
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching user notifications'
    };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log('markNotificationAsRead called with ID:', notificationId);
    
    // Parse the notification ID to get team ID and notification index
    // Handle case where teamId might contain underscores
    const parts = notificationId.split('_');
    if (parts.length < 2) {
      console.error('Invalid notification ID format:', notificationId);
      return {
        success: false,
        message: 'Invalid notification ID format'
      };
    }
    
    // The last part is the index, everything before that is the teamId
    const notificationIndex = parseInt(parts[parts.length - 1]);
    const teamId = parts.slice(0, -1).join('_');
    
    console.log('Parsed teamId:', teamId, 'notificationIndex:', notificationIndex);
    
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      console.error('Team not found:', teamId);
      return {
        success: false,
        message: 'Team not found'
      };
    }
    
    const teamData = teamDoc.data();
    const notifications = teamData.notifications || [];
    
    console.log('Team notifications:', notifications.length, 'notifications found');
    
    if (isNaN(notificationIndex) || notificationIndex >= notifications.length || notificationIndex < 0) {
      console.error('Invalid notification index:', notificationIndex, 'max index:', notifications.length - 1);
      return {
        success: false,
        message: 'Notification not found'
      };
    }
    
    // Update the specific notification
    const updatedNotifications = [...notifications];
    updatedNotifications[notificationIndex] = {
      ...updatedNotifications[notificationIndex],
      read: true,
      readAt: new Date()
    };
    
    console.log('Updating notification at index:', notificationIndex);
    
    await updateDoc(teamRef, {
      notifications: updatedNotifications,
      lastNotificationUpdate: serverTimestamp()
    });
    
    console.log('Notification marked as read successfully');
    
    return {
      success: true,
      message: 'Notification marked as read'
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error marking notification as read'
    };
  }
};

export const getTeamNotificationHistory = async (teamName) => {
  try {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('teamName', '==', teamName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: false,
        message: 'Team not found'
      };
    }
    
    const teamData = querySnapshot.docs[0].data();
    const notifications = teamData.notifications || [];
    
    return {
      success: true,
      notifications: notifications,
      teamName: teamData.teamName,
      totalNotifications: notifications.length
    };
  } catch (error) {
    console.error('Error fetching team notification history:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching team notification history'
    };
  }
};

export const clearTeamNotifications = async (teamName) => {
  try {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('teamName', '==', teamName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: false,
        message: 'Team not found'
      };
    }
    
    const teamRef = doc(db, 'teams', querySnapshot.docs[0].id);
    await updateDoc(teamRef, {
      notifications: [],
      lastNotificationUpdate: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'All notifications cleared for team'
    };
  } catch (error) {
    console.error('Error clearing team notifications:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error clearing team notifications'
    };
  }
};

export const addDownloadHistory = async (downloadData) => {
  try {
    const downloadRef = doc(collection(db, 'downloadHistory'));
    await setDoc(downloadRef, {
      downloadType: 'notification_template',
      downloadedAt: serverTimestamp(),
      downloadedBy: downloadData.adminId || 'admin',
      teamCount: downloadData.teamCount || 0,
      notificationCount: downloadData.notificationCount || 0,
      filename: downloadData.filename || '',
      ...downloadData
    });
    
    return {
      success: true,
      message: 'Download history recorded'
    };
  } catch (error) {
    console.error('Error recording download history:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error recording download history'
    };
  }
};

export const getDownloadHistory = async () => {
  try {
    const downloadHistoryRef = collection(db, 'downloadHistory');
    const q = query(downloadHistoryRef, orderBy('downloadedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const downloadHistory = [];
    querySnapshot.forEach((doc) => {
      downloadHistory.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      downloadHistory: downloadHistory
    };
  } catch (error) {
    console.error('Error fetching download history:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching download history'
    };
  }
};

export const updateNotificationWithUploadInfo = async (notificationId, uploadInfo) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      lastUploaded: serverTimestamp(),
      uploadSource: uploadInfo.source || 'excel',
      uploadBatch: uploadInfo.batchId || '',
      ...uploadInfo
    });
    
    return {
      success: true,
      message: 'Notification upload info updated'
    };
  } catch (error) {
    console.error('Error updating notification upload info:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error updating notification upload info'
    };
  }
};

// Results management functions
export const getResults = async () => {
  try {
    const resultsRef = collection(db, 'results');
    const querySnapshot = await getDocs(resultsRef);
    
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        teamName: doc.id, // Using document ID as team name
        ...doc.data()
      });
    });
    
    return {
      success: true,
      results: results
    };
  } catch (error) {
    console.error('Error fetching results:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error fetching results'
    };
  }
};

export const saveResults = async (resultsData) => {
  try {
    const batch = writeBatch(db);
    
    for (const result of resultsData) {
      if (!result.teamName) {
        continue; // Skip entries without team name
      }
      
      const resultRef = doc(db, 'results', result.teamName);
      batch.set(resultRef, {
        rank: result.rank || 0,
        problemUnderstanding: result.problemUnderstanding || 0,
        innovation: result.innovation || 0,
        feasibility: result.feasibility || 0,
        presentation: result.presentation || 0,
        total: result.total || 0,
        contestScore: result.contestScore || 0,
        grandTotal: result.grandTotal || 0,
        judgeReview: result.judgeReview || '',
        updatedAt: serverTimestamp(),
        createdAt: result.createdAt || serverTimestamp()
      });
    }
    
    await batch.commit();
    
    return {
      success: true,
      message: 'Results saved successfully'
    };
  } catch (error) {
    console.error('Error saving results:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error saving results'
    };
  }
};

export const deleteAllResults = async () => {
  try {
    const resultsRef = collection(db, 'results');
    const querySnapshot = await getDocs(resultsRef);
    
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return {
      success: true,
      message: 'All results deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting all results:', error);
    return {
      success: false,
      error: error.code,
      message: 'Error deleting all results'
    };
  }
};
