/**
 * FrameList component
 * Displays imported frames with controls for reordering, delay, and enable/disable
 */

import React, { useState } from 'react';
import { FrameData } from '../../plugin/types';

interface FrameListProps {
  frames: FrameData[];
  onUpdateFrame: (id: string, updates: Partial<FrameData>) => void;
  onRemoveFrame: (id: string) => void;
  onReorderFrames: (startIndex: number, endIndex: number) => void;
}

export function FrameList({
  frames,
  onUpdateFrame,
  onRemoveFrame,
  onReorderFrames,
}: FrameListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    onReorderFrames(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (frames.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        No frames imported. Select frames in Figma and click "Import Frames".
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-2 p-4">
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              bg-white border border-gray-200 rounded-lg p-3 cursor-move
              hover:border-blue-400 transition-colors
              ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Frame number */}
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>

              {/* Thumbnail */}
              {frame.thumbnailUrl && (
                <img
                  src={frame.thumbnailUrl}
                  alt={frame.name}
                  className="w-16 h-16 object-contain bg-gray-50 rounded border border-gray-200"
                />
              )}

              {/* Frame details */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {frame.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {frame.width} × {frame.height}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-2">
                {/* Delay input */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 whitespace-nowrap">
                    Delay (ms)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={frame.delay}
                    onChange={(e) =>
                      onUpdateFrame(frame.id, {
                        delay: Math.max(10, parseInt(e.target.value) || 10),
                      })
                    }
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Enable/disable toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={frame.enabled}
                    onChange={(e) =>
                      onUpdateFrame(frame.id, { enabled: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">Enabled</span>
                </label>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemoveFrame(frame.id)}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove frame"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
