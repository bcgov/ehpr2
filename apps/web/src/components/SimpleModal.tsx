import { Modal } from '@components';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DialogTitle } from '@headlessui/react';
import { PropsWithChildren } from 'react';

type SimpleModalProps = PropsWithChildren & {
  title: string;
  open: boolean;
  onClose: () => void;
};

export const SimepleModal = ({ title, open, onClose, children }: SimpleModalProps) => {
  return (
    <Modal open={open} handleClose={onClose}>
      <DialogTitle className='flex flex-row text-lg font-bold leading-6 text-bcBlueLink border-b p-4'>
        <div>{title}</div>
        <button autoFocus={false} aria-label='Close modal' className='ml-auto' onClick={onClose}>
          <FontAwesomeIcon icon={faWindowClose} size='lg' />
        </button>
      </DialogTitle>
      {children}
    </Modal>
  );
};
