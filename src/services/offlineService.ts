import { SportEquipment } from '@/lib/db';

interface PendingOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

class OfflineService {
  private static instance: OfflineService;
  private readonly PENDING_OPS_KEY = 'pendingOperations';

  private constructor() {}

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // Store equipment data locally
  storeEquipment(equipment: SportEquipment[]) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('equipment', JSON.stringify(equipment));
      } catch (error) {
        console.error('Error storing equipment:', error);
      }
    }
  }

  // Get equipment data from local storage
  getEquipment(): SportEquipment[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('equipment');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error getting equipment:', error);
        return [];
      }
    }
    return [];
  }

  // Add a pending operation
  addPendingOperation(operation: PendingOperation) {
    if (typeof window !== 'undefined') {
      try {
        const pendingOps = this.getPendingOperations();
        pendingOps.push(operation);
        localStorage.setItem(this.PENDING_OPS_KEY, JSON.stringify(pendingOps));
      } catch (error) {
        console.error('Error adding pending operation:', error);
      }
    }
  }

  // Get all pending operations
  getPendingOperations(): PendingOperation[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.PENDING_OPS_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error getting pending operations:', error);
        return [];
      }
    }
    return [];
  }

  // Clear all pending operations
  clearPendingOperations() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.PENDING_OPS_KEY);
      } catch (error) {
        console.error('Error clearing pending operations:', error);
      }
    }
  }
}

export const offlineService = OfflineService.getInstance(); 