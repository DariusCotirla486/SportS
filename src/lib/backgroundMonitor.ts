import { checkSuspiciousUsers } from './monitoring';

let isMonitoring = false;

export function startMonitoring() {
  if (isMonitoring) {
    console.log('Monitoring service is already running');
    return;
  }
  
  console.log('Starting monitoring service...');
  isMonitoring = true;

  // Check every 30 seconds
  const interval = setInterval(async () => {
    try {
      console.log('Running monitoring check...');
      const suspiciousUsers = await checkSuspiciousUsers();
      if (suspiciousUsers.length > 0) {
        console.log('Found suspicious users:', suspiciousUsers);
      } else {
        console.log('No suspicious users found in this check');
      }
    } catch (error) {
      console.error('Error in monitoring service:', error);
    }
  }, 30000); // 30 seconds

  // Cleanup function
  return () => {
    clearInterval(interval);
    isMonitoring = false;
    console.log('Monitoring service stopped');
  };
} 