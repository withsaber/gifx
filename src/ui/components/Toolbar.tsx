/**
 * Toolbar component
 * Contains controls for importing frames, setting global options, and generating GIF
 */

import React from 'react';
import { GifConfig } from '../../plugin/types';

interface ToolbarProps {
  config: GifConfig;
  onConfigChange: (config: Partial<GifConfig>) => void;
  onImportFrames: () => void;
  onGenerateGif: () => void;
  onUpdateAllDelays: () => void;
  isGenerating: boolean;
  hasFrames: boolean;
}

export function Toolbar({
  config,
  onConfigChange,
  onImportFrames,
  onGenerateGif,
  onUpdateAllDelays,
  isGenerating,
  hasFrames,
}: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Import button */}
        <button
          onClick={onImportFrames}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Import Frames
        </button>

        {/* Default delay */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 font-medium">
            Default Delay:
          </label>
          <input
            type="number"
            min="10"
            step="10"
            value={config.defaultDelay}
            onChange={(e) =>
              onConfigChange({
                defaultDelay: Math.max(10, parseInt(e.target.value) || 10),
              })
            }
            className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">ms</span>
          {hasFrames && (
            <button
              onClick={onUpdateAllDelays}
              className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Apply to all frames"
            >
              Apply to All
            </button>
          )}
        </div>

        {/* Loop toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.loop}
            onChange={(e) => onConfigChange({ loop: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 font-medium">Loop Forever</span>
        </label>

        {/* Scale */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 font-medium">Scale:</label>
          <select
            value={config.scale}
            onChange={(e) =>
              onConfigChange({ scale: parseFloat(e.target.value) })
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">100%</option>
            <option value="0.75">75%</option>
            <option value="0.5">50%</option>
            <option value="0.25">25%</option>
          </select>
        </div>

        {/* Quality */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 font-medium">Quality:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.quality}
            onChange={(e) =>
              onConfigChange({ quality: parseInt(e.target.value) })
            }
            className="w-24"
          />
          <span className="text-sm text-gray-500 w-8">{config.quality}</span>
        </div>

        {/* Generate button */}
        <div className="ml-auto">
          <button
            onClick={onGenerateGif}
            disabled={!hasFrames || isGenerating}
            className={`
              px-6 py-2 rounded-lg font-medium text-sm transition-colors
              ${
                hasFrames && !isGenerating
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? 'Generating...' : 'Generate GIF'}
          </button>
        </div>
      </div>
    </div>
  );
}
