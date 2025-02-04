import { tv } from 'tailwind-variants';

type AlertProps = {
  message: string;
};

const alert = tv({
  base: 'absolute bottom-4 bg-white rounded-sm shadow-md flex items-center justify-center left-1/2 -translate-x-1/2 animate-fade animate-duration-300 z-10',
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
  },
});

export function Alert({ message }: AlertProps) {
  return (
    <div className={alert({ show: message !== '' })} id="alert">
      <div className="flex w-fit flex-col items-center justify-center p-2 px-4 font-sans whitespace-nowrap">
        <p className="flex h-5 items-center justify-center text-center">
          {message}
        </p>
      </div>
    </div>
  );
}
