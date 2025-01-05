export function Popover({ text }: { text: string }): React.ReactElement {
  return (
    <div className="absolute bg-white rounded-md shadow-md flex items-center justify-center left-1/2 -translate-x-1/2 top-2 animate-fade animate-once animate-duration-300">
      <div className="w-fit flex p-2 px-4 items-center justify-center font-sans flex-col whitespace-nowrap">
        <p className="h-5 text-center items-center justify-center flex">
          {text}
        </p>
      </div>
    </div>
  );
}
