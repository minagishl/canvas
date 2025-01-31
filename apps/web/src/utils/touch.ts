import React from 'react';
import { type Point } from '~/types/canvas';

export const getTouchPoint = (
  touch: React.Touch,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  offset: Point,
  scale: number
): Point => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left - offset.x) / scale,
    y: (touch.clientY - rect.top - offset.y) / scale,
  };
};

export const getTouchDistance = (touches: React.TouchList): number => {
  const dx = touches[1].clientX - touches[0].clientX;
  const dy = touches[1].clientY - touches[0].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getTouchCenter = (touches: React.TouchList): Point => {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
};
