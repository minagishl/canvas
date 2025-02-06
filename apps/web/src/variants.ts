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

export const popover = tv({
  base: 'absolute bg-white rounded-sm shadow-base flex items-center justify-center left-1/2 -translate-x-1/2 animate-fade animate-once animate-duration-300',
  variants: {
    upper: {
      true: 'bottom-2',
      false: 'top-2',
    },
  },
});

export const sparkles = tv({
  base: 'animate-infinite animate-ease-linear group-hover:animate-pulse',
  variants: {
    position: {
      upperRight: 'animate-duration-[2000ms]',
      lowerLeft: 'animate-duration-[1000ms]',
    },
    isAnimating: {
      true: 'animate-pulse',
    },
  },
});

export const popup = tv({
  base: 'absolute hidden group-hover:block left-1/2 -translate-x-1/2',
  variants: {
    isTextObject: {
      true: 'bottom-full mb-2',
      false: 'top-full mt-2',
    },
  },
});

export const text = tv({
  base: 'absolute outline-none hover:border-2 hover:border-indigo-600',
  variants: {
    isSelected: {
      true: 'border-2 border-indigo-600',
    },
  },
});

export const frame = tv({
  base: 'flex items-center gap-2 rounded-lg p-1.5 bg-white shadow-base',
});

export const menu = tv({
  base: 'animate-fade animate-duration-300 animate-once shadow-base absolute top-2 left-1/2 mt-2 flex -translate-x-1/2 items-center justify-center gap-2 rounded-lg bg-white p-1.5',
});
