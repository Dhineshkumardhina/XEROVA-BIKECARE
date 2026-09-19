/**
 * SyncEngine - Enterprise Store-and-Forward Data Synchronization Service
 * 
 * Automatically synchronizes offline POS invoices, customers, and inventory adjustments
 * with the remote Neon PostgreSQL cloud database whenever an internet connection is active.
 */

import { offlineDB, SyncQueueItem } from '../lib/offline-db';
import { apiClient } from '../lib/api-client';
import { saleService } from './sale.service';

export interface SyncEngineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  lastError: string | null;
  queue: SyncQueueItem[];
}

type SyncStateListener = (state: SyncEngineState) => void;

export class SyncEngine {
  private isSyncing: boolean = false;
  private isOnline: boolean = navigator.onLine;
  private syncInterval: any = null;
  private heartbeatInterval: any = null;
  private lastSyncedAt: number | null = null;
  private lastError: string | null = null;
  private listeners: Set<SyncStateListener> = new Set();
  private cachedQueue: SyncQueueItem[] = [];

  constructor() {
    // Initial online state
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  /**
   * Subscribe to real-time sync engine state changes
   */
  subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('[SyncEngine] Listener notification error:', err);
      }
    });
  }

  getState(): SyncEngineState {
    const pendingItems = this.cachedQueue.filter((i) => i.status === 'PENDING' || i.status === 'SYNCING');
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: pendingItems.length,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
      queue: this.cachedQueue
    };
  }

  /**
   * Start the background sync and connection heartbeat workers
   */
  start(syncIntervalMs: number = 15000) {
    this.refreshQueue();

    // Heartbeat check: tests actual API reachability (catches cases where Wi-Fi is connected but internet is down)
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => this.checkBackendReachability(), 12000);

    // Periodic sync worker
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, syncIntervalMs);

    // Initial check & sync
    this.checkBackendReachability().then(() => {
      if (this.isOnline) {
        this.sync();
      }
    });
  }

  /**
   * Stop background sync workers
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle browser online/offline events
   */
  private async handleNetworkChange(online: boolean) {
    console.log(`[SyncEngine] Network change detected: ${online ? 'ONLINE' : 'OFFLINE'}`);
    this.isOnline = online;
    this.notify();

    if (online) {
      // Verify actual backend reachability before triggering sync
      const reachable = await this.checkBackendReachability();
      if (reachable) {
        this.sync();
      }
    }
  }

  /**
   * Actively ping the backend health endpoint to verify cloud reachability
   */
  async checkBackendReachability(): Promise<boolean> {
    try {
      const res = await apiClient.get('/health', { timeout: 4000 });
      const reachable = res.status === 200 && res.data?.data?.status === 'UP';
      
      if (this.isOnline !== reachable) {
        this.isOnline = reachable;
        console.log(`[SyncEngine] Cloud reachability status updated: ${reachable ? 'CONNECTED' : 'UNREACHABLE'}`);
        this.notify();
      }
      return reachable;
    } catch {
      if (this.isOnline) {
        this.isOnline = false;
        console.warn('[SyncEngine] Cloud API unreachable — operating in Offline Mode.');
        this.notify();
      }
      return false;
    }
  }

  /**
   * Refresh the local in-memory cache of the sync queue
   */
  async refreshQueue(): Promise<SyncQueueItem[]> {
    try {
      this.cachedQueue = await offlineDB.getAllSyncItems();
      this.notify();
      return this.cachedQueue;
    } catch (err) {
      console.warn('[SyncEngine] Error loading sync queue from IndexedDB:', err);
      return [];
    }
  }

  /**
   * Queue a new mutation to be synced
   */
  async queueMutation(
    entityType: 'SALE' | 'CUSTOMER' | 'STOCK_ADJUSTMENT' | 'PAYMENT',
    payload: any,
    clientReference: string
  ): Promise<SyncQueueItem> {
    const item = await offlineDB.addToSyncQueue({
      entityType,
      payload,
      clientReference
    });

    await this.refreshQueue();
    console.log(`[SyncEngine] Queued ${entityType} (${clientReference}) for sync. Queue size: ${this.getState().pendingCount}`);

    // If online, immediately attempt to flush the queue
    if (this.isOnline && !this.isSyncing) {
      this.sync();
    }

    return item;
  }

  /**
   * Perform the synchronization operation: flush pending items to Neon cloud
   */
  async sync(): Promise<{ success: boolean; syncedCount: number; failedCount: number }> {
    if (this.isSyncing) {
      console.log('[SyncEngine] Sync already in progress, skipping duplicate call.');
      return { success: false, syncedCount: 0, failedCount: 0 };
    }

    if (!this.isOnline) {
      console.log('[SyncEngine] Cannot sync: currently in Offline Mode.');
      return { success: false, syncedCount: 0, failedCount: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notify();

    let syncedCount = 0;
    let failedCount = 0;

    try {
      const pendingItems = await offlineDB.getPendingSyncItems();

      if (pendingItems.length === 0) {
        this.isSyncing = false;
        this.notify();
        return { success: true, syncedCount: 0, failedCount: 0 };
      }

      console.log(`[SyncEngine] 🚀 Starting cloud auto-sync: processing ${pendingItems.length} pending record(s)...`);

      for (const item of pendingItems) {
        // Double-check connectivity before each item
        if (!this.isOnline) {
          console.warn('[SyncEngine] Connection lost during sync run. Pausing queue processing.');
          break;
        }

        try {
          await offlineDB.markSyncItemStatus(item.id, 'SYNCING');
          await this.syncSingleItem(item);
          await offlineDB.markSyncItemStatus(item.id, 'SYNCED');
          syncedCount++;
          console.log(`[SyncEngine] ✅ Synced item ${item.clientReference} (${item.entityType}) successfully.`);
        } catch (itemErr: any) {
          failedCount++;
          const errorMessage = itemErr.response?.data?.message || itemErr.message || 'Sync failed';
          console.error(`[SyncEngine] ❌ Failed to sync ${item.clientReference}:`, errorMessage);

          // If the invoice was already created on the server (e.g. duplicate retry), consider it synced
          if (
            errorMessage.includes('already exists') ||
            errorMessage.includes('unique constraint') ||
            errorMessage.includes('Unique constraint failed')
          ) {
            console.warn(`[SyncEngine] Record ${item.clientReference} already confirmed in cloud DB. Marking as SYNCED.`);
            await offlineDB.markSyncItemStatus(item.id, 'SYNCED');
            syncedCount++;
            failedCount--;
          } else {
            await offlineDB.markSyncItemStatus(item.id, 'FAILED', errorMessage);
            this.lastError = errorMessage;

            // If network failure / connection refused, stop the batch and wait for reconnection
            if (!itemErr.response || itemErr.code === 'ECONNREFUSED' || itemErr.message?.includes('Network Error')) {
              this.isOnline = false;
              break;
            }
          }
        }
      }

      if (syncedCount > 0) {
        this.lastSyncedAt = Date.now();
        // Clean up synced items older than 7 days
        await offlineDB.clearSyncedItems(7).catch(() => {});
      }
    } catch (err: any) {
      console.error('[SyncEngine] Fatal sync failure:', err);
      this.lastError = err.message || 'Sync worker encountered an unexpected error';
    } finally {
      this.isSyncing = false;
      await this.refreshQueue();
    }

    return {
      success: failedCount === 0,
      syncedCount,
      failedCount
    };
  }

  /**
   * Process a single queued item according to its entity type
   */
  private async syncSingleItem(item: SyncQueueItem): Promise<any> {
    switch (item.entityType) {
      case 'SALE': {
        return await saleService.create(item.payload);
      }
      case 'CUSTOMER': {
        return await apiClient.post('/crm/customers', item.payload);
      }
      case 'STOCK_ADJUSTMENT': {
        return await apiClient.post('/stock/adjust', item.payload);
      }
      case 'PAYMENT': {
        return await apiClient.post('/accounts/payments', item.payload);
      }
      default:
        throw new Error(`Unsupported sync entity type: ${item.entityType}`);
    }
  }
}

// Global Singleton Instance
export const syncEngine = new SyncEngine();
