const navigateToUrl = (url: string) => {
  window.location.href = url;
};

export const Modal = () => {
  return (
    <>
      <div className="fixed left-0 top-0 size-full bg-black opacity-50" />
      <div className="fixed left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform gap-2 rounded-xl bg-white p-2">
        <p
          className="cursor-pointer rounded-md p-2 text-black transition-colors hover:bg-gray-100"
          onClick={() => navigateToUrl('https://github.com/minagishl/canvas')}
        >
          GitHub
        </p>
      </div>
    </>
  );
};
