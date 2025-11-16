/**
 * Shared types between plugin code and UI
 */

// Represents a single frame exported from Figma
export interface ExportedFrame {
  id: string;
  name: string;
  imageData: Uint8Array; // PNG image data
  width: number;
  height: number;
}

// Messages sent from UI to plugin
export type UIMessage =
  | { type: 'import-frames' }
  | { type: 'close-plugin' };

// Messages sent from plugin to UI
export type PluginMessage =
  | { type: 'frames-exported'; frames: ExportedFrame[] }
  | { type: 'error'; message: string }
  | { type: 'no-frames-selected' };

// Frame data used in the UI (extends ExportedFrame with UI state)
export interface FrameData {
  id: string;
  name: string;
  imageData: Uint8Array;
  width: number;
  height: number;
  delay: number; // Delay in milliseconds
  enabled: boolean; // Whether this frame is included in the GIF
  thumbnailUrl?: string; // Object URL for thumbnail preview
}

// GIF configuration options
export interface GifConfig {
  defaultDelay: number; // Default delay in ms for all frames
  loop: boolean; // Whether to loop the GIF (true = loop forever, false = play once)
  quality: number; // Quality setting (1-10, 10 being best)
  scale: number; // Scale factor (1 = original size, 0.5 = 50%, etc.)
  compressionEnabled: boolean; // Whether to enable compression
}
