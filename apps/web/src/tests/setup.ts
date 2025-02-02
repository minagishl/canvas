import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { createCanvas } from 'canvas';

vi.stubGlobal(
  'HTMLCanvasElement',
  class {
    getContext = vi.fn(() => createCanvas(300, 150).getContext('2d'));
  }
);
