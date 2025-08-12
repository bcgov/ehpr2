import { ReactNode } from 'react';

type AdminSectionProps = {
  title: string;
  children: ReactNode;
};

export const AdminSection = ({ title, children }: AdminSectionProps) => {
  return (
    <div className='border rounded-sm p-4 mb-8'>
      <div className='text-xl font-bold mb-4'>{title}</div>
      {children}
    </div>
  );
};
