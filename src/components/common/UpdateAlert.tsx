import React, { useState, useEffect } from 'react';

// Declare the window API exposed by preload.cjs
declare global {
  interface Window {
    api: {
      onUpdateAvailable: (cb: () => void) => void;
      onDownloadProgress: (cb: (percent: number) => void) => void;
      onUpdateDownloaded: (cb: () => void) => void;
      installUpdate: () => void;
    };
  }
}

export const UpdateAlert: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<'none' | 'available' | 'downloading' | 'ready'>('none');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!window.api) return;

    window.api.onUpdateAvailable(() => {
      setUpdateStatus('available');
    });

    window.api.onDownloadProgress((percent) => {
      setUpdateStatus('downloading');
      setProgress(Math.round(percent));
    });

    window.api.onUpdateDownloaded(() => {
      setUpdateStatus('ready');
    });
  }, []);

  if (updateStatus === 'none') return null;

  return (
    <div className="fixed top-16 right-4 w-80 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-sm">system_update</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900">Software Update</h4>
            
            {updateStatus === 'available' && (
              <p className="text-xs text-slate-500 mt-1">A new version of XEROVA is available and will begin downloading in the background.</p>
            )}
            
            {updateStatus === 'downloading' && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Downloading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {updateStatus === 'ready' && (
              <>
                <p className="text-xs text-slate-500 mt-1 mb-3">The update has been downloaded and is ready to install.</p>
                <button 
                  onClick={() => window.api.installUpdate()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-md transition-colors"
                >
                  Restart & Install
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
