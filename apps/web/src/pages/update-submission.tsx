import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UpdateSubmissionForm } from '../components/submission/components';

const UpdateSubmission = () => {
  const { push, query, isReady } = useRouter();
  const { code, email } = query;

  useEffect(() => {
    if (isReady && !code) {
      push('/');
    }
  }, [code, isReady, push]);

  return (
    <>
      <div className='grow bg-bcLightBackground flex justify-center md:pt-11 pt-5'>
        <div className='h-min w-full xl:w-layout mx-2 mb-12'>
          <div className='bg-white rounded p-4 border-b mb-5'>
            {email && code && (
              <UpdateSubmissionForm email={email as string} code={code as string} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateSubmission;
