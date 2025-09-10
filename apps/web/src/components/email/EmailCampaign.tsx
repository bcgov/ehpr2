import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { FullScreenModal, FullScreenModalFooter } from '../FullScreenModal';
import { DialogTitle } from '@headlessui/react';
import { Button } from '../Button';
import { TemplatePreview } from './TemplatePreview';
import { EmailData, EmailTemplate } from '@constants';
import { CreateTemplate } from './CreateTemplate';

interface EmailCampaignProps {
  emails: EmailData[];
  open: boolean;
  close: (value: boolean) => void;
}

export const EmailCampaign = (props: EmailCampaignProps) => {
  const { emails, open, close } = props;

  const [openTemplatePreview, setOpenTemplatePreview] = useState<boolean>(false);
  const [template, setTemplate] = useState<EmailTemplate>({ subject: '', body: '' });

  // close template modal
  const handleClose = () => {
    close(false);
  };

  // show template preview modal
  const showPreview = () => {
    setOpenTemplatePreview(true);
  };

  // hide template preview modal
  const closePreview = () => {
    setOpenTemplatePreview(false);
  };

  return (
    <FullScreenModal open={open} handleClose={handleClose}>
      <DialogTitle className='flex flex-row text-lg font-bold leading-6 text-bc-blue-link border-b p-4'>
        <div>Create Email Template</div>
        <button
          autoFocus={false}
          aria-label='Close modal'
          className='ml-auto'
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faWindowClose} size='2x' />
        </button>
      </DialogTitle>
      <div className='p-4 mt-4'>
        {/* create template modal */}
        <CreateTemplate template={template} setTemplate={setTemplate} />
        {/* template preview */}
        {openTemplatePreview && template.body && (
          <TemplatePreview emails={emails} open={open} onClose={closePreview} template={template} />
        )}
      </div>
      <FullScreenModalFooter>
        <Button variant='primary' onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant='secondary'
          onClick={showPreview}
          disabled={!template.body || !template.subject}
        >
          Show Preview
        </Button>
      </FullScreenModalFooter>
    </FullScreenModal>
  );
};
