import { ExportedFrame } from './types';

/**
 * Exports selected frames from Figma as PNG images
 * @param scale - Export scale (1 = 1x, 2 = 2x for better quality)
 * @returns Array of exported frames with image data
 */
export async function exportSelectedFrames(scale: number = 2): Promise<ExportedFrame[]> {
  const selection = figma.currentPage.selection;

  // Filter selection to only include frames
  const frames = selection.filter(
    node => node.type === 'FRAME'
  ) as FrameNode[];

  if (frames.length === 0) {
    return [];
  }

  const exportedFrames: ExportedFrame[] = [];

  for (const frame of frames) {
    try {
      // Export frame as PNG with specified scale
      const imageData = await frame.exportAsync({
        format: 'PNG',
        constraint: {
          type: 'SCALE',
          value: scale,
        },
      });

      exportedFrames.push({
        id: frame.id,
        name: frame.name,
        imageData,
        width: frame.width,
        height: frame.height,
      });
    } catch (error) {
      console.error(`Failed to export frame ${frame.name}:`, error);
    }
  }

  return exportedFrames;
}

/**
 * Checks if current selection contains any frames
 * @returns True if at least one frame is selected
 */
export function hasFramesSelected(): boolean {
  const selection = figma.currentPage.selection;
  return selection.some(node => node.type === 'FRAME');
}

/**
 * Gets count of selected frames
 * @returns Number of frames in current selection
 */
export function getSelectedFrameCount(): number {
  const selection = figma.currentPage.selection;
  return selection.filter(node => node.type === 'FRAME').length;
}
