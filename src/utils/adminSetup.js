import { createDefaultAdmin } from '../services/firebase';

// Admin setup utility
export const setupDefaultAdmin = async () => {
  try {
    console.log('Setting up default admin...');
    const result = await createDefaultAdmin();
    
    if (result.success) {
      console.log('✅ Default admin setup completed!');
      console.log('Admin ID:', result.credentials.adminId);
      console.log('Password:', result.credentials.password);
      console.log('⚠️  Please change the default password after first login!');
      return result;
    } else {
      console.log('ℹ️', result.message);
      return result;
    }
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    return {
      success: false,
      message: 'Failed to setup admin'
    };
  }
};

// Function to call from browser console or component
window.setupAdmin = setupDefaultAdmin;
