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

export const alert = tv({
  base: 'absolute bottom-4 bg-white rounded-sm shadow-base flex items-center justify-center left-1/2 -translate-x-1/2 animate-fade animate-duration-300 z-10',
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
  },
});

export const loading = tv({
  base: 'fixed top-4 right-4 z-40 flex select-none items-center rounded-lg bg-white p-1.5 shadow-base',
  variants: {
    hidden: {
      true: 'hidden',
    },
  },
});
