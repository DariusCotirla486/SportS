import { checkSuspiciousActivity } from './monitoring';

const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function startMonitoringWorker() {
    console.log('Starting monitoring worker...');
    
    // Run immediately on start
    checkSuspiciousActivity().catch(console.error);
    
    // Then run every interval
    setInterval(() => {
        checkSuspiciousActivity().catch(console.error);
    }, MONITORING_INTERVAL);
} 