/**
 * Type definitions for gif.js
 * The gif.js library doesn't include TypeScript definitions,
 * so we provide minimal types here for our usage.
 */

declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    repeat?: number;
    transparent?: string | null;
    background?: string;
    dither?: boolean;
    debug?: boolean;
  }

  interface FrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  class GIF {
    constructor(options: GIFOptions);

    addFrame(
      image: HTMLCanvasElement | HTMLImageElement | CanvasRenderingContext2D,
      options?: FrameOptions
    ): void;

    render(): void;

    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;

    abort(): void;
  }

  export = GIF;
}
