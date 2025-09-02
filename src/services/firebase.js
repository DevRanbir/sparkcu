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
  serverTimestamp
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
