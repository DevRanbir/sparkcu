// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile
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

// Export Firebase services
export { auth, db, analytics };

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
      members: allMembers,
      createdAt: serverTimestamp(),
      emailVerified: false,
      registrationComplete: true
    });

    return {
      success: true,
      user: user,
      message: 'Registration successful! Please check your email for verification.'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Find the team where this user is the leader
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('leaderFirebaseUid', '==', user.uid));
    const querySnapshot = await getDocs(q);

    let userData = null;
    if (!querySnapshot.empty) {
      // Get the first (should be only) matching team
      userData = querySnapshot.docs[0].data();
    }

    return {
      success: true,
      user: user,
      userData: userData,
      message: 'Login successful!'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
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
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return 'An error occurred. Please try again.';
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

// Fetch all teams for admin
export const getAllTeams = async () => {
  try {
    const teamsRef = collection(db, 'teams');
    const querySnapshot = await getDocs(teamsRef);
    
    const teams = [];
    querySnapshot.forEach((doc) => {
      teams.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
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

// Auth state observer
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};
