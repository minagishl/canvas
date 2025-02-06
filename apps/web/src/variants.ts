import { tv } from 'tailwind-variants';

export const container = tv({
  base: 'flex flex-row z-40 -translate-x-1/2 select-none',
  variants: {
    top: {
      true: 'fixed top-4 left-1/2 -translate-x-1/2',
    },
  },
});

export const button = tv({
  base: 'cursor-pointer rounded-sm p-2.5 transition-colors hover:bg-gray-100',
  variants: {
    isSelected: {
      true: 'bg-indigo-100 text-indigo-600',
    },
  },
});
