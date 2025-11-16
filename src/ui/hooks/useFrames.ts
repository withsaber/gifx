/**
 * Custom hook for managing frame state
 */

import { useState, useCallback } from 'react';
import { FrameData, ExportedFrame } from '../../plugin/types';
import { createImageUrl } from '../gif/gifGenerator';

export function useFrames(defaultDelay: number = 100) {
  const [frames, setFrames] = useState<FrameData[]>([]);

  /**
   * Adds imported frames from Figma
   */
  const addFrames = useCallback((exportedFrames: ExportedFrame[]) => {
    const newFrames: FrameData[] = exportedFrames.map((frame) => ({
      ...frame,
      delay: defaultDelay,
      enabled: true,
      thumbnailUrl: createImageUrl(frame.imageData),
    }));

    setFrames(newFrames);
  }, [defaultDelay]);

  /**
   * Updates a specific frame's properties
   */
  const updateFrame = useCallback((id: string, updates: Partial<FrameData>) => {
    setFrames((prev) =>
      prev.map((frame) =>
        frame.id === id ? { ...frame, ...updates } : frame
      )
    );
  }, []);

  /**
   * Removes a frame by ID
   */
  const removeFrame = useCallback((id: string) => {
    setFrames((prev) => {
      const frame = prev.find(f => f.id === id);
      if (frame?.thumbnailUrl) {
        URL.revokeObjectURL(frame.thumbnailUrl);
      }
      return prev.filter((frame) => frame.id !== id);
    });
  }, []);

  /**
   * Reorders frames (for drag and drop)
   */
  const reorderFrames = useCallback((startIndex: number, endIndex: number) => {
    setFrames((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  /**
   * Updates all frames with a new default delay
   */
  const updateAllDelays = useCallback((delay: number) => {
    setFrames((prev) =>
      prev.map((frame) => ({ ...frame, delay }))
    );
  }, []);

  /**
   * Clears all frames
   */
  const clearFrames = useCallback(() => {
    // Revoke all object URLs
    frames.forEach((frame) => {
      if (frame.thumbnailUrl) {
        URL.revokeObjectURL(frame.thumbnailUrl);
      }
    });
    setFrames([]);
  }, [frames]);

  return {
    frames,
    addFrames,
    updateFrame,
    removeFrame,
    reorderFrames,
    updateAllDelays,
    clearFrames,
  };
}
