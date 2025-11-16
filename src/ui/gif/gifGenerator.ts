/**
 * GIF generation module
 * Uses gif.js library to create animated GIFs from frame images
 *
 * gif.js is chosen because:
 * - Works entirely in the browser (no server needed)
 * - Uses web workers for performance
 * - Good quality output
 * - Active maintenance and community support
 */

import GIF from 'gif.js';
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

  // Filter out disabled frames
  const enabledFrames = frames.filter(f => f.enabled);

  if (enabledFrames.length === 0) {
    throw new Error('No frames enabled for GIF generation');
  }

  // Determine output dimensions based on scale
  const firstFrame = enabledFrames[0];
  const width = Math.round(firstFrame.width * config.scale);
  const height = Math.round(firstFrame.height * config.scale);

  // Initialize GIF encoder
  // gif.js uses web workers (loaded from CDN by default)
  const gif = new GIF({
    workers: 2,
    quality: 11 - config.quality, // gif.js uses 1-10 where 1 is best, we invert for intuitive UX
    width,
    height,
    repeat: config.loop ? 0 : -1, // 0 = loop forever, -1 = no loop
    transparent: null,
  });

  // Track progress
  gif.on('progress', (p: number) => {
    if (onProgress) {
      onProgress(p);
    }
  });

  // Add each frame to the GIF
  for (const frame of enabledFrames) {
    const image = await loadImageFromUint8Array(frame.imageData, width, height);
    gif.addFrame(image, {
      delay: frame.delay,
    });
  }

  // Render the GIF
  return new Promise((resolve, reject) => {
    gif.on('finished', (blob: Blob) => {
      resolve(blob);
    });

    gif.on('error', (error: Error) => {
      reject(error);
    });

    gif.render();
  });
}

/**
 * Loads an image from Uint8Array data and draws it to a canvas
 * @param imageData - PNG image data as Uint8Array
 * @param targetWidth - Target width for scaling
 * @param targetHeight - Target height for scaling
 * @returns Canvas element with the image drawn at target size
 */
async function loadImageFromUint8Array(
  imageData: Uint8Array,
  targetWidth: number,
  targetHeight: number
): Promise<HTMLCanvasElement> {
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

    return canvas;
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
