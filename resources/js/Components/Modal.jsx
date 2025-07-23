import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';


export default function Modal({
  children,
  show = false,
  maxWidth = '2xl',
  closeable = true, // control whether modal can be closed by outside click or ESC
  onClose = () => {},
}) {
  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
      '4xl': 'sm:max-w-4xl',
  }[maxWidth];

  // This handles ESC key close or programmatic close
  const handleClose = () => {
    if (closeable) {
      onClose();
    }
  };

  // This handles backdrop clicks:
  // If closeable is false, prevent closing by stopping propagation
  const handleBackdropClick = (event) => {
    if (!closeable) {
      event.stopPropagation();
    } else {
      handleClose(); // close modal on backdrop click only if closeable is true
    }
  };

  return (
    <Transition show={show} leave="duration-200">
      <Dialog
        as="div"
        id="modal"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
        onClose={handleClose} // ESC key or programmatic close
      >
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/75"
            onClick={handleBackdropClick} // handle outside clicks here
          />
        </Transition.Child>

        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <Dialog.Panel
            className={`mb-6 transform overflow-hidden rounded-xl bg-white shadow-xl transition-all sm:mx-auto sm:w-full dark:bg-gray-800 ${maxWidthClass}`}
          >
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
