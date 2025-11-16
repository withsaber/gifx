/**
 * PreviewPane component
 * Shows GIF preview and provides download/copy controls
 */

import React, { useEffect, useState } from 'react';

interface PreviewPaneProps {
  gifUrl: string | null;
  gifBlob: Blob | null;
  progress: number;
  isGenerating: boolean;
}

export function PreviewPane({
  gifUrl,
  gifBlob,
  progress,
  isGenerating,
}: PreviewPaneProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleDownload = () => {
    if (!gifUrl) return;

    const link = document.createElement('a');
    link.href = gifUrl;
    link.download = `animation-${Date.now()}.gif`;
    link.click();
  };

  const handleCopyToClipboard = async () => {
    if (!gifBlob) return;

    try {
      // Modern Clipboard API - may not work in all Figma plugin contexts
      // but we try it anyway
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/gif': gifBlob }),
        ]);
        setCopied(true);
      } else {
        // Fallback: show message that copy is not supported
        alert('Clipboard API not supported in this environment. Please use the download button.');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please use the download button.');
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-900">Preview</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {isGenerating ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Generating GIF...</p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round(progress * 100)}%
            </p>
          </div>
        ) : gifUrl ? (
          <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <img
                src={gifUrl}
                alt="Generated GIF"
                className="w-full h-auto rounded"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDownload}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Download GIF
              </button>

              <button
                onClick={handleCopyToClipboard}
                className={`
                  w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>

              {gifBlob && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Size: {(gifBlob.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            <svg
              className="w-16 h-16 mx-auto mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>Your GIF preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
