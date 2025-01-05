import { tv } from "tailwind-variants";

const popover = tv({
  base: "absolute bg-white rounded-md shadow-md flex items-center justify-center left-1/2 -translate-x-1/2 animate-fade animate-once animate-duration-300",
  variants: {
    upper: {
      true: "bottom-2",
      false: "top-2",
    },
  },
});

export function Popover({
  text,
  upper,
}: {
  text: string;
  upper: boolean;
}): React.ReactElement {
  return (
    <div className={popover({ upper })}>
      <div className="w-fit flex p-2 px-4 items-center justify-center font-sans flex-col whitespace-nowrap">
        <p className="h-5 text-center items-center justify-center flex">
          {text}
        </p>
      </div>
    </div>
  );
}
