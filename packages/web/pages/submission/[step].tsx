import { useRouter } from 'next/router';

import { ExternalLink, Form, Stepper } from '@components';

const FORM_STEPS = ['Primary', 'Contact', 'Credential', 'Preferences', 'Review and Submit'];

const Submission = () => {
  const router = useRouter();

  const step = Number(router.query.step);

  return (
    <>
      <h1 className='text-4xl mb-3'>Health Provider Registry for BC’s Emergency Response</h1>
      <section className='mb-4'>
        <p>
          Please refer to the <ExternalLink href='#'>FAQ’s</ExternalLink> when completing this form.
        </p>
        <p>
          If you encounter problems completing/submitting this form, please email{' '}
          <ExternalLink href='mailto:EHPRQuestions@gov.bc.ca'>EHPRQuestions@gov.bc.ca</ExternalLink>
          .
        </p>
      </section>

      <p className='font-bold mb-4'>
        Your personal information is being collected in compliance with BC privacy legislation under
        section 26(c) and (e) of the Freedom of Information and Protection of Privacy Act. Your
        information will be retained for five years and be shared with the Ministry of Health,
        Health Match BC and health authorities, to support B.C.’s health emergency response.
      </p>

      <p className='font-bold mb-4'>
        If you have any questions about our collection or use of personal information, please email
        your inquiries to{' '}
        <ExternalLink href='mailto:EHPRQuestions@gov.bc.ca'>EHPRQuestions@gov.bc.ca</ExternalLink>.
      </p>

      <div className='bg-white rounded'>
        <div className='p-4 border-b'>
          <Stepper formSteps={FORM_STEPS} step={step} />
        </div>

        <Form />
      </div>
    </>
  );
};

export default Submission;
