/**
 * SyncEngine - Bi-directional data synchronization service
 * 
 * This service monitors the local offline SQLite database for PENDING mutations
 * and synchronizes them with the remote cloud database when the network is available.
 */

export class SyncEngine {
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly cloudApiUrl: string;

  constructor(cloudApiUrl: string = 'https://api.xerova.com/sync') {
    this.cloudApiUrl = cloudApiUrl;
    
    // Listen for network changes to immediately trigger a sync when reconnecting
    window.addEventListener('online', () => this.sync());
  }

  /**
   * Start the background sync worker
   */
  start(intervalMs: number = 60000) {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => this.sync(), intervalMs);
    // Initial sync
    this.sync();
  }

  /**
   * Stop the background sync worker
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform the bi-directional sync operation
   */
  async sync() {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    try {
      console.log('[SyncEngine] Starting bi-directional sync...');
      
      // 1. PUSH PHASE: Fetch local pending records
      // In a real implementation, this would query the local API/Prisma for records with syncStatus = 'PENDING_*'
      const pendingRecords = await this.fetchLocalPendingRecords();
      
      if (pendingRecords.length > 0) {
        console.log(`[SyncEngine] Pushing ${pendingRecords.length} records to cloud.`);
        // Push to cloud API
        await this.pushToCloud(pendingRecords);
        // Mark local as SYNCED
        await this.markLocalAsSynced(pendingRecords.map(r => r.id));
      }

      // 2. PULL PHASE: Fetch latest changes from cloud
      const lastSyncTimestamp = this.getLastSyncTimestamp();
      console.log(`[SyncEngine] Pulling changes since ${new Date(lastSyncTimestamp).toISOString()}`);
      
      const cloudChanges = await this.pullFromCloud(lastSyncTimestamp);
      
      if (cloudChanges.length > 0) {
        console.log(`[SyncEngine] Received ${cloudChanges.length} updates from cloud. Merging locally.`);
        // Merge into local DB
        await this.mergeToLocalDB(cloudChanges);
      }

      // Update sync timestamp
      this.updateLastSyncTimestamp(Date.now());
      console.log('[SyncEngine] Sync complete.');
    } catch (error) {
      console.error('[SyncEngine] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // --- Stubs for actual API/DB calls ---

  private async fetchLocalPendingRecords(): Promise<any[]> {
    // Stub: Query local DB for pending sync records
    return [];
  }

  private async pushToCloud(records: any[]): Promise<void> {
    // Stub: POST records to cloud API
  }

  private async markLocalAsSynced(ids: string[]): Promise<void> {
    // Stub: Update local DB syncStatus to 'SYNCED'
  }

  private async pullFromCloud(sinceTimestamp: number): Promise<any[]> {
    // Stub: GET records from cloud API modified after sinceTimestamp
    return [];
  }

  private async mergeToLocalDB(records: any[]): Promise<void> {
    // Stub: Upsert records into local DB
  }

  private getLastSyncTimestamp(): number {
    return parseInt(localStorage.getItem('lastSyncTimestamp') || '0', 10);
  }

  private updateLastSyncTimestamp(timestamp: number): void {
    localStorage.setItem('lastSyncTimestamp', timestamp.toString());
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();
