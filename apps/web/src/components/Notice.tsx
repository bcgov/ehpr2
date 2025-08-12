import { ReactNode } from 'react';

type NoticeProps = {
  children: ReactNode;
};

export const Notice = ({ children }: NoticeProps) => {
  return (
    <div className='border-l-10 border-bc-blue-primary p-6 pb-5 md:pb-6 mb-5 bg-bc-light-background text-left flex items-center'>
      {children}
    </div>
  );
};
