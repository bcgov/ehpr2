import { ReactNode } from 'react';

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

export const ExternalLink = ({ href, children }: ExternalLinkProps) => {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-bc-blue-link underline'
    >
      {children}
    </a>
  );
};
