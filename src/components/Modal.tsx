type ModalProps = {
  children?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export function Modal({ children, isOpen, onClose }: ModalProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${
        isOpen ? '' : 'hidden'
      }`}
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-xl bg-white p-2 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-md bg-indigo-100 p-2 py-4 font-sans text-2xl font-semibold text-indigo-600">
          <h2>Welcome to canvas!</h2>
          <p className="p-2 text-center text-base font-normal text-indigo-400">
            This application is currently under development. Please be aware
            that malfunctions or unexpected behaviors may occur.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
