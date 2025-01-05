import { Pencil } from "lucide-react";

export function Menu() {
  return (
    <div className="absolute bg-white rounded-md shadow-md flex items-center justify-center left-1/2 -translate-x-1/2 top-2 animate-fade animate-once animate-duration-300 mt-2 p-2">
      <div className="w-fit flex p-2 items-center justify-center font-sans flex-col whitespace-nowrap hover:bg-gray-100 rounded-md transition-colors">
        <p className="h-5 text-center items-center justify-center flex">
          <Pencil className="w-5 h-5" />
        </p>
      </div>
    </div>
  );
}
