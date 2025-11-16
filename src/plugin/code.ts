/**
 * Main plugin code - runs in the Figma plugin sandbox
 * This file handles communication with the UI and frame export
 */

import { UIMessage, PluginMessage } from './types';
import { exportSelectedFrames, hasFramesSelected } from './selection';

// Show the plugin UI
// Size is set to accommodate the frame list, controls, and preview
figma.showUI(__html__, {
  width: 800,
  height: 600,
  themeColors: true,
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg: UIMessage) => {
  switch (msg.type) {
    case 'import-frames':
      await handleImportFrames();
      break;

    case 'close-plugin':
      figma.closePlugin();
      break;

    default:
      console.warn('Unknown message type:', msg);
  }
};

/**
 * Handles the import frames request from the UI
 * Exports selected frames and sends them to the UI
 */
async function handleImportFrames() {
  try {
    // Check if any frames are selected
    if (!hasFramesSelected()) {
      const message: PluginMessage = {
        type: 'no-frames-selected',
      };
      figma.ui.postMessage(message);
      return;
    }

    // Export selected frames at 2x scale for better quality
    const frames = await exportSelectedFrames(2);

    if (frames.length === 0) {
      const message: PluginMessage = {
        type: 'error',
        message: 'Failed to export frames. Please try again.',
      };
      figma.ui.postMessage(message);
      return;
    }

    // Send the exported frames to the UI
    const message: PluginMessage = {
      type: 'frames-exported',
      frames,
    };
    figma.ui.postMessage(message);

    // Notify user
    figma.notify(`Imported ${frames.length} frame${frames.length === 1 ? '' : 's'}`);
  } catch (error) {
    const message: PluginMessage = {
      type: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
    figma.ui.postMessage(message);
  }
}
