import { alert } from '~/variants';

type AlertProps = {
  message: string;
};
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
