import { useRouter } from 'next/router';
import { useEffect, useRef, ReactNode } from 'react';

type FormStepHeaderProps = {
  children: ReactNode;
};
/**
 * a styled header that auto focuses when the step parameter changes
 */
export const FormStepHeader = ({ children }: FormStepHeaderProps) => {
  const router = useRouter();
  const step = Number(router.query.step);
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headerRef.current?.focus();
  }, [step]);

  return (
    <h1
      ref={headerRef}
      tabIndex={-1}
      className='text-bc-blue-primary text-center text-2xl focus:outline-hidden mb-5'
    >
      {children}
    </h1>
  );
};
