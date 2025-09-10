import Link from 'next/link';
import { ReactNode } from 'react';

type FooterLinkProps = {
  href: string;
  children: ReactNode;
};

const FooterLink = ({ href, children }: FooterLinkProps) => {
  return <Link href={href}>{children}</Link>;
};

export const Footer: React.FC = () => {
  return (
    <footer className='w-full bg-bc-blue-primary border-t-2 border-bc-yellow-primary md:px-12'>
      <div className='bar-separator mx-2 md:mx-0 flex-col flex md:flex-row md:items-center md:align-center text-white py-2'>
        <FooterLink href='https://www2.gov.bc.ca/gov/content/about-gov-bc-ca'>
          About gov.bc.ca
        </FooterLink>
        <FooterLink href='https://www2.gov.bc.ca/gov/content/home/disclaimer'>
          Disclaimer
        </FooterLink>
        <FooterLink href='https://www2.gov.bc.ca/gov/content/home/privacy'>Privacy</FooterLink>
        <FooterLink href='https://www2.gov.bc.ca/gov/content/home/accessible-government'>
          Accessibility
        </FooterLink>
        <FooterLink href='https://www2.gov.bc.ca/gov/content/home/copyright'>Copyright</FooterLink>
        <FooterLink href='https://www2.gov.bc.ca/gov/content/home/get-help-with-government-services'>
          Contact Us
        </FooterLink>
      </div>
    </footer>
  );
};
