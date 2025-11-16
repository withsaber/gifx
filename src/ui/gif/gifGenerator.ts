/**
 * GIF generation module
 * Uses gifenc library to create animated GIFs from frame images
 *
 * gifenc is chosen because:
 * - Works entirely in the browser (no server needed)
 * - No web worker dependencies (bundle-friendly)
 * - Works reliably in Figma's sandboxed environment
 * - Modern ESM-compatible codebase
 * - Good quality output with efficient encoding
 */

import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { FrameData, GifConfig } from '../../plugin/types';

export interface GenerateGifOptions {
  frames: FrameData[];
  config: GifConfig;
  onProgress?: (progress: number) => void;
}

/**
 * Generates a GIF from an array of frames
 * @param options - Generation options including frames and config
 * @returns Promise that resolves to a Blob containing the GIF data
 */
export async function generateGif(options: GenerateGifOptions): Promise<Blob> {
  const { frames, config, onProgress } = options;

  console.log('[GIF] Starting generation with', frames.length, 'frames');

  // Filter out disabled frames
  const enabledFrames = frames.filter(f => f.enabled);

  console.log('[GIF] Enabled frames:', enabledFrames.length);

  if (enabledFrames.length === 0) {
    throw new Error('No frames enabled for GIF generation');
  }

  // Determine output dimensions based on scale
  const firstFrame = enabledFrames[0];
  const width = Math.round(firstFrame.width * config.scale);
  const height = Math.round(firstFrame.height * config.scale);

  console.log('[GIF] Output dimensions:', width, 'x', height);

  // Initialize GIF encoder
  console.log('[GIF] Initializing GIF encoder...');
  const gif = GIFEncoder();

  console.log('[GIF] Encoder initialized successfully');

  // Process each frame
  console.log('[GIF] Processing frames...');
  for (let i = 0; i < enabledFrames.length; i++) {
    const frame = enabledFrames[i];
    console.log(`[GIF] Processing frame ${i + 1}/${enabledFrames.length}`);

    try {
      // Load and scale the image
      const imageData = await getImageData(frame.imageData, width, height);

      // Quantize the colors to create a palette
      // Higher quality = more colors in palette (up to 256)
      const maxColors = Math.min(256, Math.max(16, config.quality * 25));
      const palette = quantize(imageData.data, maxColors);

      // Apply the palette to get indexed pixels
      const index = applyPalette(imageData.data, palette);

      // Write frame to GIF
      gif.writeFrame(index, width, height, {
        palette,
        delay: frame.delay,
        // Disposal method 2 = restore to background (prevents frame artifacts)
        dispose: 2,
      });

      console.log(`[GIF] Frame ${i + 1} added successfully`);

      // Update progress
      if (onProgress) {
        onProgress((i + 1) / enabledFrames.length);
      }
    } catch (error) {
      console.error(`[GIF] Failed to process frame ${i + 1}:`, error);
      throw error;
    }
  }

  console.log('[GIF] All frames processed, finalizing GIF...');

  // Finalize the GIF
  gif.finish();

  // Convert to Blob
  const buffer = gif.bytes();
  const blob = new Blob([buffer], { type: 'image/gif' });

  console.log('[GIF] GIF created successfully! Size:', blob.size, 'bytes');

  return blob;
}

/**
 * Gets ImageData from a Uint8Array PNG
 * @param imageData - PNG image data as Uint8Array
 * @param targetWidth - Target width for scaling
 * @param targetHeight - Target height for scaling
 * @returns ImageData with RGBA pixel data
 */
async function getImageData(
  imageData: Uint8Array,
  targetWidth: number,
  targetHeight: number
): Promise<ImageData> {
  // Convert Uint8Array to Blob
  const blob = new Blob([imageData], { type: 'image/png' });
  const url = URL.createObjectURL(blob);

  try {
    // Load image
    const img = await loadImage(url);

    // Create canvas and draw scaled image
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Get ImageData
    return ctx.getImageData(0, 0, targetWidth, targetHeight);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Loads an image from a URL
 * @param url - Image URL (can be object URL)
 * @returns Promise that resolves to HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Creates an object URL from a Uint8Array for preview purposes
 * @param imageData - PNG image data
 * @returns Object URL that must be revoked when done
 */
export function createImageUrl(imageData: Uint8Array): string {
  const blob = new Blob([imageData], { type: 'image/png' });
  return URL.createObjectURL(blob);
}
