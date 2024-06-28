import { useState } from 'react';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  FullScreenModal,
  FullScreenModalFooter,
  Modal,
  TipTapEditor,
  useAuthContext,
} from '@components';
import { DialogTitle, Description } from '@headlessui/react';
import { sendMassEmail } from '@services';
import { EmailData, EmailTemplate } from '@constants';

interface TemplatePreviewProps {
  emails: EmailData[];
  template: EmailTemplate;
  open: boolean;
  onClose: () => void;
}

export const TemplatePreview = ({ emails, template, open, onClose }: TemplatePreviewProps) => {
  const { user } = useAuthContext();

  // current list of select registrant emails
  const [showEmailList, setShowEmailList] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);

  // handler for sending test email
  const handleSendEmailTest = async () => {
    setLoading(true);
    if (user?.email) {
      await sendMassEmail({
        subject: template.subject,
        body: template.body,
        data: [{ id: user.id, email: user.email }],
      });
    }
    setLoading(false);
  };

  // handler for sending mass email
  const handleSendMassEmail = async () => {
    setLoading(true);
    const data = emails.map(e => ({ id: e.id, email: e.email }));
    await sendMassEmail({
      userId: user?.id,
      subject: template.subject,
      body: template.body,
      data,
    });
    setLoading(false);
    closeConfirmationModal();
  };
  // handler for showing selected registrant emails for mass email send
  const handleShowEmailList = () => {
    setShowEmailList(prev => !prev);
  };

  const openConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  return (
    <>
      {showConfirmationModal ? (
        <Modal open={showConfirmationModal} handleClose={closeConfirmationModal}>
          <DialogTitle className='text-lg font-bold leading-6 text-bcBlueLink border-b p-4'>
            Please Confirm
          </DialogTitle>
          {/* TODO: add legal disclaimer */}
          <div className='p-4'>
            Please confirm that you wish to send this email to {emails.length}&nbsp;
            {emails.length > 1 ? 'registrants' : 'registrant'}
          </div>
          <div className='p-4 mt-4 flex flex-row justify-between'>
            <Button variant='secondary' onClick={closeConfirmationModal} disabled={loading}>
              Cancel
            </Button>
            <Button variant='secondary' onClick={handleSendMassEmail} loading={loading}>
              Send
            </Button>
          </div>
        </Modal>
      ) : (
        <FullScreenModal open={open} handleClose={onClose}>
          <DialogTitle className='flex flex-row text-lg font-bold leading-6 text-bcBlueLink border-b p-4'>
            <div>Template Preview</div>
            <button aria-label='Close modal' className='ml-auto' onClick={onClose}>
              <FontAwesomeIcon icon={faWindowClose} size='2x' />
            </button>
          </DialogTitle>
          <Description className='p-4'>
            Please review the template and send a test email below:
          </Description>

          <div className='mx-5 mb-5 border-b'>
            <Button
              variant='primary'
              type='submit'
              onClick={() => handleSendEmailTest()}
              loading={loading}
            >
              Send Test Email
            </Button>
            <p className='py-4'>
              <b>This will send an email to: </b> {user?.email}
            </p>
          </div>

          {/* read only editor for preview */}
          <label htmlFor='subject-line' className='mx-5 font-bold'>
            Subject Line
          </label>
          <div className='flex flex-row p-2 my-1 mx-5 border '>
            <input
              id='subject-line'
              tabIndex={-1}
              name='subject-line'
              type='text'
              value={template.subject}
              readOnly
              className='grow focus:outline-none'
            />
          </div>
          <div className='mx-5 mt-2 font-bold'>Body</div>
          <TipTapEditor
            showToolbar={false}
            template={template}
            className='px-5 my-1'
            editorFullRoundBorder
            isEditable={false}
          />
          <div className='m-5'>
            <Button variant='primary' onClick={() => handleShowEmailList()}>
              Review Sending list
            </Button>

            {showEmailList && (
              <div className='grid grid-cols-3 p-5 min-h-52 max-h-96 overflow-y-auto'>
                <div className='col-span-3 my-3 mr-3'>
                  <strong>Total Emails:</strong> {emails.length}
                </div>
                {emails.map(({ email, name }) => (
                  <div key={email + name} className='w-full mb-2'>
                    <span>
                      <strong>Name: </strong>
                      {name}
                    </span>
                    <p>
                      <strong>Email: </strong>
                      {email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <FullScreenModalFooter>
            <Button variant='primary' onClick={onClose}>
              Edit Template
            </Button>
            <Button variant='secondary' onClick={openConfirmationModal} loading={loading}>
              Confirm
            </Button>
          </FullScreenModalFooter>
        </FullScreenModal>
      )}
    </>
  );
};
