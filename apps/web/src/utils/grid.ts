import { Point } from '../types/canvas';
import { GRID_SIZE } from './constants';

export const snapToGrid = (point: Point): Point => {
  const gridSize = GRID_SIZE / 2;

  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
};

export const snapToGridSize = (size: number): number => {
  const gridSize = GRID_SIZE / 4;
  return Math.round(size / gridSize) * gridSize;
};
