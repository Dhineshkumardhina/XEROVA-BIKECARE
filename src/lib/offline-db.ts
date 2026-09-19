/**
 * Offline-First IndexedDB Database Engine for XEROVA BIKE ERP
 * 
 * Provides persistent local client-side storage for:
 * - Offline sync queue (store-and-forward mutations)
 * - Spare parts item master cache (for barcode scanning & offline search)
 * - Customers directory cache
 * - Offline invoice history cache
 * - Authenticated user session cache
 */

export interface SyncQueueItem {
  id: string;
  entityType: 'SALE' | 'CUSTOMER' | 'STOCK_ADJUSTMENT' | 'PAYMENT';
  payload: any;
  clientReference: string; // e.g. Invoice # or Customer Phone
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  createdAt: number;
  syncedAt?: number;
  retryCount: number;
  lastError?: string;
}

export interface CachedAuthUser {
  id: string;
  username: string;
  email?: string;
  fullName: string;
  role: string;
  roleDisplayName?: string;
  permissions: string[];
  lastLoginTime: number;
  token?: string;
}

const DB_NAME = 'XerovaBikeErpOfflineDB';
const DB_VERSION = 1;

class OfflineDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not available in this environment.'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Sync Queue
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('createdAt', 'createdAt', { unique: false });
          syncStore.createIndex('entityType', 'entityType', { unique: false });
        }

        // 2. Items Catalog Cache
        if (!db.objectStoreNames.contains('items_cache')) {
          const itemsStore = db.createObjectStore('items_cache', { keyPath: 'id' });
          itemsStore.createIndex('sku', 'sku', { unique: false });
          itemsStore.createIndex('name', 'name', { unique: false });
          itemsStore.createIndex('barcode', 'barcode', { unique: false });
        }

        // 3. Customers Cache
        if (!db.objectStoreNames.contains('customers_cache')) {
          const custStore = db.createObjectStore('customers_cache', { keyPath: 'id' });
          custStore.createIndex('mobile', 'mobile', { unique: false });
          custStore.createIndex('name', 'name', { unique: false });
        }

        // 4. Invoices Cache
        if (!db.objectStoreNames.contains('invoices_cache')) {
          const invStore = db.createObjectStore('invoices_cache', { keyPath: 'id' });
          invStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 5. Auth / Config Cache
        if (!db.objectStoreNames.contains('auth_cache')) {
          db.createObjectStore('auth_cache', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  // ---------------------------------------------------------------------------
  // SYNC QUEUE OPERATIONS
  // ---------------------------------------------------------------------------

  async addToSyncQueue(
    item: Omit<SyncQueueItem, 'id' | 'status' | 'createdAt' | 'retryCount'>
  ): Promise<SyncQueueItem> {
    const db = await this.openDB();
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: 'PENDING',
      createdAt: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const req = store.add(queueItem);

      req.onsuccess = () => resolve(queueItem);
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const index = store.index('status');
      const req = index.getAll('PENDING');

      req.onsuccess = () => {
        const items: SyncQueueItem[] = req.result || [];
        // Sort oldest first (FIFO order)
        items.sort((a, b) => a.createdAt - b.createdAt);
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getAllSyncItems(): Promise<SyncQueueItem[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const req = store.getAll();

      req.onsuccess = () => {
        const items: SyncQueueItem[] = req.result || [];
        items.sort((a, b) => b.createdAt - a.createdAt); // newest first
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async updateSyncItem(item: SyncQueueItem): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const req = store.put(item);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async markSyncItemStatus(
    id: string,
    status: 'SYNCED' | 'FAILED' | 'SYNCING',
    errorMsg?: string
  ): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const req = store.get(id);

      req.onsuccess = () => {
        const item: SyncQueueItem = req.result;
        if (!item) return resolve();

        item.status = status;
        if (status === 'SYNCED') {
          item.syncedAt = Date.now();
        } else if (status === 'FAILED') {
          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = errorMsg || 'Unknown sync error';
        }

        store.put(item);
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  async clearSyncedItems(olderThanDays = 7): Promise<number> {
    const db = await this.openDB();
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const index = store.index('status');
      const req = index.getAll('SYNCED');

      req.onsuccess = () => {
        const items: SyncQueueItem[] = req.result || [];
        let deletedCount = 0;
        for (const item of items) {
          if (item.syncedAt && item.syncedAt < cutoff) {
            store.delete(item.id);
            deletedCount++;
          }
        }
        resolve(deletedCount);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // ---------------------------------------------------------------------------
  // ITEMS CATALOG CACHE
  // ---------------------------------------------------------------------------

  async cacheItems(items: any[]): Promise<void> {
    if (!items || items.length === 0) return;
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('items_cache', 'readwrite');
      const store = tx.objectStore('items_cache');
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getCachedItems(): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('items_cache', 'readonly');
      const store = tx.objectStore('items_cache');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async updateCachedItemStock(itemIdOrSku: string, deductedQty: number): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('items_cache', 'readwrite');
      const store = tx.objectStore('items_cache');
      const req = store.get(itemIdOrSku);

      req.onsuccess = () => {
        let item = req.result;
        if (item) {
          item.currentStock = Math.max(0, (item.currentStock || 0) - deductedQty);
          store.put(item);
          return resolve();
        }

        // If not found by ID, try looking up by SKU
        const skuIndex = store.index('sku');
        const skuReq = skuIndex.get(itemIdOrSku);
        skuReq.onsuccess = () => {
          if (skuReq.result) {
            const bySku = skuReq.result;
            bySku.currentStock = Math.max(0, (bySku.currentStock || 0) - deductedQty);
            store.put(bySku);
          }
          resolve();
        };
        skuReq.onerror = () => resolve();
      };
      req.onerror = () => resolve();
    });
  }

  // ---------------------------------------------------------------------------
  // CUSTOMERS CACHE
  // ---------------------------------------------------------------------------

  async cacheCustomers(customers: any[]): Promise<void> {
    if (!customers || customers.length === 0) return;
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('customers_cache', 'readwrite');
      const store = tx.objectStore('customers_cache');
      for (const c of customers) {
        store.put(c);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getCachedCustomers(): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('customers_cache', 'readonly');
      const store = tx.objectStore('customers_cache');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // ---------------------------------------------------------------------------
  // INVOICES CACHE
  // ---------------------------------------------------------------------------

  async cacheInvoices(invoices: any[]): Promise<void> {
    if (!invoices || invoices.length === 0) return;
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('invoices_cache', 'readwrite');
      const store = tx.objectStore('invoices_cache');
      for (const inv of invoices) {
        store.put(inv);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getCachedInvoices(): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('invoices_cache', 'readonly');
      const store = tx.objectStore('invoices_cache');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // ---------------------------------------------------------------------------
  // AUTH & SESSION CACHE
  // ---------------------------------------------------------------------------

  async cacheAuthUser(user: CachedAuthUser): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('auth_cache', 'readwrite');
      const store = tx.objectStore('auth_cache');
      store.put({ key: 'last_active_user', ...user });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getCachedAuthUser(): Promise<CachedAuthUser | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction('auth_cache', 'readonly');
        const store = tx.objectStore('auth_cache');
        const req = store.get('last_active_user');

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }
}

export const offlineDB = new OfflineDB();
