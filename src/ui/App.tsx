/**
 * Main App component
 * Orchestrates communication between plugin and UI, manages state
 */

import React, { useEffect, useState } from 'react';
import { PluginMessage, GifConfig } from '../plugin/types';
import { useFrames } from './hooks/useFrames';
import { generateGif } from './gif/gifGenerator';
import { FrameList } from './components/FrameList';
import { Toolbar } from './components/Toolbar';
import { PreviewPane } from './components/PreviewPane';

const DEFAULT_CONFIG: GifConfig = {
  defaultDelay: 100,
  loop: true,
  quality: 8,
  scale: 1,
  compressionEnabled: false,
};

export function App() {
  const [config, setConfig] = useState<GifConfig>(DEFAULT_CONFIG);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    frames,
    addFrames,
    updateFrame,
    removeFrame,
    reorderFrames,
    updateAllDelays,
  } = useFrames(config.defaultDelay);

  // Listen for messages from plugin
  useEffect(() => {
    const handleMessage = (event: MessageEvent<PluginMessage>) => {
      const msg = event.data.pluginMessage;

      switch (msg.type) {
        case 'frames-exported':
          addFrames(msg.frames);
          break;

        case 'no-frames-selected':
          alert('Please select at least one frame in Figma.');
          break;

        case 'error':
          alert(`Error: ${msg.message}`);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addFrames]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (gifUrl) {
        URL.revokeObjectURL(gifUrl);
      }
    };
  }, [gifUrl]);

  const handleImportFrames = () => {
    parent.postMessage({ pluginMessage: { type: 'import-frames' } }, '*');
  };

  const handleConfigChange = (updates: Partial<GifConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdateAllDelays = () => {
    updateAllDelays(config.defaultDelay);
  };

  const handleGenerateGif = async () => {
    if (frames.length === 0) return;

    // Clear previous GIF
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      setGifUrl(null);
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const blob = await generateGif({
        frames,
        config,
        onProgress: (p) => setProgress(p),
      });

      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      setGifBlob(blob);
    } catch (error) {
      console.error('GIF generation failed:', error);
      alert(
        `Failed to generate GIF: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Toolbar
        config={config}
        onConfigChange={handleConfigChange}
        onImportFrames={handleImportFrames}
        onGenerateGif={handleGenerateGif}
        onUpdateAllDelays={handleUpdateAllDelays}
        isGenerating={isGenerating}
        hasFrames={frames.length > 0}
      />

      <div className="flex-1 flex overflow-hidden">
        <FrameList
          frames={frames}
          onUpdateFrame={updateFrame}
          onRemoveFrame={removeFrame}
          onReorderFrames={reorderFrames}
        />

        <PreviewPane
          gifUrl={gifUrl}
          gifBlob={gifBlob}
          progress={progress}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}
