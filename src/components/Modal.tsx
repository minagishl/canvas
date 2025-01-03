type ModalProps = {
  children?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export function Modal({ children, isOpen, onClose }: ModalProps) {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${
        isOpen ? "" : "hidden"
      }`}
      onClick={onClose}
    >
      <div
        className="bg-white p-2 rounded-xl shadow-md relative max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-center bg-indigo-100 rounded-md p-2 py-4 text-indigo-600 font-sans text-2xl font-semibold flex-col">
          <h2>Welcome to canvas!</h2>
          <p className="text-indigo-400 p-2 text-base font-normal text-center">
            This application is currently under development. Please be aware
            that malfunctions or unexpected behaviors may occur.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
