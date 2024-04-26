import { Dialog, Transition } from "@headlessui/react";
import type { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { Fragment } from "react";

type ConfirmationModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  name: string;
  description: string;
  onConfirm: MouseEventHandler<HTMLButtonElement> | undefined;
  isLoading?: boolean;
};

const ConfirmationModal = ({
  isOpen,
  setIsOpen,
  name,
  description,
  onConfirm,
  isLoading,
}: ConfirmationModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {name}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                    onClick={onConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationModal;