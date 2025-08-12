import { Dispatch, SetStateAction } from 'react';
import { Button } from '@components';

interface HyperLinkInsertProps {
  close: () => void;
  callback: () => void;
  linkText: string;
  setLinkText: Dispatch<SetStateAction<string>>;
}

// small input for inserting a hyperlink
export const HyperlinkInsert = ({
  close,
  callback,
  linkText,
  setLinkText,
}: HyperLinkInsertProps) => {
  return (
    <div className='absolute mt-11 w-96 z-50 bg-white'>
      <div className='border-2 border-black p-2 rounded-sm'>
        <span className='font-bold '>Insert Link</span>
        <input
          type='text'
          value={linkText}
          className='border rounded-sm p-2 my-3 w-full'
          placeholder='Insert address...'
          onChange={e => setLinkText(e?.target?.value)}
        />
        <div className='flex flex-row justify-between my-2'>
          <Button variant='primary' onClick={close}>
            Cancel
          </Button>
          <Button variant='primary' onClick={callback}>
            Insert
          </Button>
        </div>
      </div>
    </div>
  );
};
