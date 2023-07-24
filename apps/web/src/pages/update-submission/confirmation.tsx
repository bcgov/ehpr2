import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ExternalLink, Link, Notice } from '@components';

const Confirmation: React.FC = () => {
  const { push, query, isReady } = useRouter();
  const id: string = query.id as string;

  useEffect(() => {
    // redirect to the home page if the id is not present
    if (isReady && !id) {
      push('/');
    }
  });

  if (!id) return null;

  const dashedId =
    id.substring(0, 3) +
    '-' +
    id.substring(3, 6) +
    '-' +
    id.substring(6, 9) +
    '-' +
    id.substring(9);
  return (
    <div className='md:pt-40 pt-12 px-5 md:px-4'>
      <div className='max-w-xl'>
        <div className='md:text-4xl text-bcBluePrimary '>
          Thank you for updating your information in the Emergency Health Provider Registry.
        </div>
        <div>
          Your participation is an important part of B.C.’s ability to respond to emergency events.
        </div>
        <div>
          Please refer to the{' '}
          <u className='text-bcBluePrimary'>
            <Link href={'/'} variant='link'>
              EHPR homepage{' '}
            </Link>
          </u>
          for up-to-date information about the EHPR program.
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
