import { Dispatch, SetStateAction } from 'react';
import { EmailTemplate } from '@constants';
import { TipTapEditor } from '../tiptap';

interface CreateTemplateProps {
  template: EmailTemplate;
  setTemplate: Dispatch<SetStateAction<EmailTemplate>>;
}

export const CreateTemplate = ({ template, setTemplate }: CreateTemplateProps) => {
  return (
    <>
      <div className='flex flex-row p-2 mb-2 border rounded'>
        <input
          autoFocus
          name='subject-line'
          type='text'
          value={template.subject}
          onChange={e =>
            setTemplate((prev: EmailTemplate) => ({ ...prev, subject: e.target.value }))
          }
          className='grow focus:outline-none'
          placeholder='Enter Subject line...'
        />
      </div>

      <TipTapEditor
        template={template}
        setTemplate={setTemplate}
        showToolbar
        editorFullRoundBorder={false}
        isEditable
      />
    </>
  );
};
