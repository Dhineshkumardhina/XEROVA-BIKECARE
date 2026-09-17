import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const NetworkBanner: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white text-center py-1.5 text-sm font-semibold z-50 flex items-center justify-center gap-2">
      <span className="material-symbols-outlined text-[18px]">wifi_off</span>
      You are currently offline. Changes are saved locally and will sync when you reconnect.
    </div>
  );
};
