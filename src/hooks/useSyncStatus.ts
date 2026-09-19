import { useState, useEffect, useCallback } from 'react';
import { syncEngine, SyncEngineState } from '../services/SyncEngine';
import { SyncQueueItem } from '../lib/offline-db';

export interface UseSyncStatusReturn extends SyncEngineState {
  syncNow: () => Promise<{ success: boolean; syncedCount: number; failedCount: number }>;
  refreshQueue: () => Promise<SyncQueueItem[]>;
}

export function useSyncStatus(): UseSyncStatusReturn {
  const [state, setState] = useState<SyncEngineState>(() => syncEngine.getState());

  useEffect(() => {
    // Subscribe to SyncEngine state updates
    const unsubscribe = syncEngine.subscribe((updatedState) => {
      setState(updatedState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const syncNow = useCallback(async () => {
    return await syncEngine.sync();
  }, []);

  const refreshQueue = useCallback(async () => {
    return await syncEngine.refreshQueue();
  }, []);

  return {
    ...state,
    syncNow,
    refreshQueue
  };
}
