import { tv } from 'tailwind-variants';

export const button = tv({
  base: 'cursor-pointer rounded-sm p-2.5 transition-colors hover:bg-gray-100',
  variants: {
    isSelected: {
      true: 'bg-indigo-100 text-indigo-600',
    },
  },
});
