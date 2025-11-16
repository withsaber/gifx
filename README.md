# GifX - GIF Maker for Figma

A Figma plugin that creates animated GIFs from selected frames with full control over timing, ordering, and quality.

## Features

- **Import Frames**: Select 5-7 (or more) frames in Figma and import them as high-quality PNG images (2x scale)
- **Reorder Frames**: Drag and drop to reorder frames in your animation
- **Per-Frame Delay**: Set individual delay times (in milliseconds) for each frame
- **Global Delay**: Set a default delay for all frames and apply it with one click
- **Loop Control**: Choose between looping forever or playing once
- **Quality Settings**: Adjust quality (1-10) to balance file size and visual fidelity
- **Scale Options**: Export at 100%, 75%, 50%, or 25% of original size
- **GIF Preview**: See your animation before downloading
- **Download**: Save the generated GIF to your computer
- **Copy to Clipboard**: Copy the GIF directly (browser support varies)

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Figma desktop app

### Local Development

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

   This will create a `dist/` folder with:
   - `code.js` - Plugin backend code
   - `index.html` - Plugin UI

4. **Load the plugin in Figma**
   - Open Figma desktop app
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Navigate to this project folder and select `manifest.json`
   - The plugin will appear in your plugins list

### Development with Watch Mode

For active development with auto-rebuild:

```bash
npm run watch
```

This runs both the plugin and UI builds in watch mode. Changes to TypeScript or React files will automatically rebuild.

## How to Use

1. **Create or open a Figma file** with multiple frames containing your animation sequence

2. **Select the frames** you want to include in the GIF (in any order)

3. **Run the plugin**:
   - `Plugins` → `Development` → `GifX - GIF Maker for Frames`

4. **Import frames**:
   - Click "Import Frames" button
   - Selected frames will appear in the left panel

5. **Configure your GIF**:
   - **Reorder**: Drag frames up/down to change sequence
   - **Set delays**: Adjust per-frame delay (default 100ms)
   - **Global settings**:
     - Default Delay: Set and apply to all frames
     - Loop Forever: Toggle looping
     - Scale: Reduce output size (25%-100%)
     - Quality: Adjust compression (1-10, higher = better)

6. **Generate**:
   - Click "Generate GIF"
   - Wait for progress bar to complete
   - Preview appears on the right

7. **Export**:
   - Click "Download GIF" to save
   - Or "Copy to Clipboard" (if supported)

## Project Architecture

### Structure

```
gifx/
├── manifest.json          # Figma plugin manifest
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build config (UI)
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
├── src/
│   ├── plugin/            # Plugin backend (runs in Figma sandbox)
│   │   ├── code.ts        # Main plugin entry point
│   │   ├── selection.ts   # Frame selection and export helpers
│   │   └── types.ts       # Shared TypeScript types
│   └── ui/                # Plugin UI (runs in iframe)
│       ├── index.html     # HTML entry point
│       ├── main.tsx       # React entry point
│       ├── App.tsx        # Main app component
│       ├── styles.css     # Tailwind CSS imports
│       ├── components/
│       │   ├── FrameList.tsx      # Frame list with drag & drop
│       │   ├── Toolbar.tsx        # Top controls
│       │   └── PreviewPane.tsx    # Preview and download
│       ├── hooks/
│       │   └── useFrames.ts       # Frame state management
│       └── gif/
│           ├── gifGenerator.ts    # GIF encoding logic
│           └── compressor.ts      # Compression stub (future)
└── dist/                  # Built plugin files (generated)
    ├── code.js
    └── index.html
```

### Plugin vs UI

The Figma plugin architecture separates code into two sandboxes:

- **Plugin Code** (`src/plugin/code.ts`):
  - Runs in Figma's main thread
  - Has access to Figma document API
  - Exports frames as PNG images
  - Communicates with UI via `postMessage`

- **UI Code** (`src/ui/`):
  - Runs in an iframe (browser environment)
  - No access to Figma API
  - Handles React UI, GIF generation, user interactions
  - Communicates with plugin via `postMessage`

### GIF Generation

The plugin uses **[gif.js](https://github.com/jnordberg/gif.js)** for GIF encoding:

- Runs in web workers for performance
- Supports quality adjustment
- Good cross-browser compatibility
- Active community support

GIF generation process (`src/ui/gif/gifGenerator.ts`):
1. Load each frame's PNG data
2. Draw to canvas at target scale
3. Add frames to gif.js encoder with delays
4. Render to Blob
5. Create object URL for preview/download

### Build Process

Two separate build targets:

1. **Plugin Code**: Built with `esbuild`
   - Input: `src/plugin/code.ts`
   - Output: `dist/code.js`
   - Target: ES2017 (Figma sandbox compatibility)

2. **UI**: Built with `Vite`
   - Input: `src/ui/index.html`
   - Output: `dist/index.html` (single file)
   - Includes: React, Tailwind, gif.js
   - Uses `vite-plugin-singlefile` for single-file output

## How to Extend

### Adding New GIF Options

To add new export options (e.g., frame rate, dithering):

1. **Update types** (`src/plugin/types.ts`):
   ```typescript
   export interface GifConfig {
     // ... existing fields
     dithering: boolean;
   }
   ```

2. **Add UI control** (`src/ui/components/Toolbar.tsx`):
   ```tsx
   <label>
     <input
       type="checkbox"
       checked={config.dithering}
       onChange={(e) => onConfigChange({ dithering: e.target.checked })}
     />
     Enable Dithering
   </label>
   ```

3. **Apply to GIF generation** (`src/ui/gif/gifGenerator.ts`):
   ```typescript
   const gif = new GIF({
     // ... existing options
     dither: config.dithering,
   });
   ```

### Implementing Real Compression

The current implementation uses gif.js quality settings. For advanced compression:

1. **Install a compression library** (e.g., `gifsicle-wasm`):
   ```bash
   npm install gifsicle-wasm
   ```

2. **Implement in** `src/ui/gif/compressor.ts`:
   ```typescript
   import { run as runGifsicle } from 'gifsicle-wasm';

   export async function compressGif(gifBlob: Blob, quality: number): Promise<Blob> {
     const arrayBuffer = await gifBlob.arrayBuffer();
     const compressed = await runGifsicle([
       '-O3',
       `--lossy=${100 - quality * 10}`,
     ], new Uint8Array(arrayBuffer));
     return new Blob([compressed], { type: 'image/gif' });
   }
   ```

3. **Call from** `App.tsx` after generation:
   ```typescript
   if (config.compressionEnabled) {
     blob = await compressGif(blob, config.quality);
   }
   ```

### Adding Color Depth Control

To control color palette size (impacts file size and quality):

1. Add `colors` field to `GifConfig` (e.g., 256, 128, 64, 32)
2. Pass to gif.js constructor as `colors` option
3. Add slider or select in Toolbar component

### Customizing Export Scale

The plugin exports frames at 2x scale for quality. To make this configurable:

1. Add `exportScale` to plugin message types
2. Send from UI in `import-frames` message
3. Pass to `exportSelectedFrames(scale)` in `code.ts`

## Troubleshooting

### Plugin won't load
- Ensure `npm run build` completed without errors
- Check that `dist/code.js` and `dist/index.html` exist
- Verify `manifest.json` points to correct paths

### Import button does nothing
- Ensure you've selected **frames** (not groups or other objects)
- Check browser console in plugin window (right-click → Inspect)

### GIF generation fails
- Check frame count (very large animations may cause memory issues)
- Reduce scale or quality if frames are very large
- Check browser console for errors

### Copy to clipboard doesn't work
- Clipboard API is not supported in all plugin contexts
- Use "Download GIF" as fallback

### Large file sizes
- Reduce scale (50% or 25%)
- Lower quality setting
- Reduce number of frames or frame delays
- Consider implementing advanced compression

## Tech Stack

- **TypeScript**: Type-safe development
- **React 18**: UI framework
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool for UI
- **esbuild**: Fast bundler for plugin code
- **gif.js**: GIF encoding library

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

---

**Note**: This plugin is designed for Figma only (not FigJam). To add FigJam support, update `editorType` in `manifest.json` and test frame export compatibility.
