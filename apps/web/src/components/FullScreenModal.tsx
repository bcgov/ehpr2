import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, PropsWithChildren, ReactNode } from 'react';

export interface FullScreenModalProps {
  open: boolean;
  handleClose: () => void;
}

const { Root, Child } = Transition;

// modal without a small fixed width to take up more of the screen
const ModalContainer: React.FC<FullScreenModalProps> = ({ children, open, handleClose }) => {
  return (
    <Root show={open} as={Fragment}>
      <Dialog
        as='div'
        static
        className='fixed z-10 inset-0 overflow-y-auto w-full m-2'
        open={open}
        onClose={handleClose}
      >
        <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
          <Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity pointer-events-none' />
          </Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
            &#8203;
          </span>
          <Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            enterTo='opacity-100 translate-y-0 sm:scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0 sm:scale-100'
            leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          >
            <div className='inline-block align-bottom bg-white rounded text-left shadow-xl transform transition-all sm:my-8 sm:align-middle w-3/4 p-1'>
              <div className='bg-white '>{children}</div>
            </div>
          </Child>
        </div>
      </Dialog>
    </Root>
  );
};

export interface FullScreenModalInterface extends React.FC<FullScreenModalProps> {
  Title: typeof Dialog.Title;
  Description: typeof Dialog.Description;
}

export const FullScreenModal = ModalContainer as FullScreenModalInterface;
FullScreenModal.Title = Dialog.Title;
FullScreenModal.Description = Dialog.Description;

export const FullScreenModalFooter = ({ children }: PropsWithChildren<ReactNode>) => {
  return <div className='bg-gray-50 px-10 py-3 flex flex-row justify-between'>{children}</div>;
};
