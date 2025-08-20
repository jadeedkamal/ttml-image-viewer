import React from 'react';

interface Props {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SasExpiredBanner({ onRefresh, isRefreshing }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-red-800 font-medium">Access Token Expired</h3>
          <p className="text-red-700 text-sm">Your Azure SAS token has expired and needs to be refreshed.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
        </button>
      </div>
    </div>
  );
}