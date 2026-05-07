/// <reference types="vite/client" />

/**
 * Ambient declarations for asset imports.
 *
 * Vite's `?url` and `?raw` suffixes resolve at build time, but TypeScript
 * needs to be told what they return. The Vite client types cover the most
 * common cases; we add a CSV declaration here so `?url` imports of
 * `.csv` files type-check correctly.
 */

declare module '*.csv' {
  const url: string;
  export default url;
}

declare module '*.csv?url' {
  const url: string;
  export default url;
}

declare module '*.csv?raw' {
  const raw: string;
  export default raw;
}

declare module '*.png?url' {
  const url: string;
  export default url;
}

declare module 'troika-three-text';

declare namespace JSX {
  interface IntrinsicElements {
    text: {
      ref?: unknown;
      position?: [number, number, number];
      rotation?: [number, number, number];
      text?: string;
      fontSize?: number;
      color?: string;
      anchorX?: string | number;
      anchorY?: string | number;
      maxWidth?: number;
      overflowWrap?: string;
      textAlign?: string;
      outlineWidth?: number | string;
      outlineColor?: string;
      outlineOpacity?: number;
    };
  }
}
