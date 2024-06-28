import { useRouter } from 'next/router';

import { ExternalLink, Form, Stepper } from '@components';
import { useEffect, useRef } from 'react';

const FORM_STEPS = ['Primary', 'Contact', 'Credentials', 'Preferences', 'Review and Submit'];

const Submission = () => {
  const router = useRouter();

  const step = Number(router.query.step);

  // do not scroll to the top of the form on initial load
  const formRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef<number>(1);
  useEffect(() => {
    if (!isNaN(step) && prevStepRef.current !== step && formRef.current) {
      window.scrollTo(0, formRef.current.offsetTop);
      prevStepRef.current = step;
    }
  }, [step]);

  return (
    <>
      <div className='grow bg-bcLightBackground flex justify-center md:pt-11 pt-5'>
        <div className='h-min w-full xl:w-layout mx-2 mb-12'>
          <h1 className='text-3xl mb-7 mx-6 lg:text-4xl lg:mb-3 lg:mx-0'>
            Health Provider Registry for BC’s Emergency Response
          </h1>
          <section className='mb-7'>
            <p className='mb-4'>
              The <b>Emergency Health Provider Registry (EHPR)</b> is an online registry to support
              the proactive and voluntary deployment of health sector workers to communities across
              B.C. during emergency events including wildfires, floods, and pandemics.
            </p>
            <p className='mb-4'>
              <b>For more information about the EHPR, please refer to the&nbsp;</b>
              <ExternalLink href='/assets/EHPR-FAQs-May-2024.pdf'>FAQs</ExternalLink>.
            </p>
            <p className='mb-4'>
              Health sector workers and students (including resident physicians and employed student
              nurses) are invited to register using the form below.
            </p>
            <p className='mb-4'>
              Completing this form does not create an obligation for you to respond to emergency
              events, and participation in any deployment is always voluntary. Employees of BC
              health authorities are encouraged to discuss registration with your supervisor, as all
              deployments will require supervisor sign-off.
            </p>
            <p className='mb-4'>
              Health authorities, Providence Health Care, Health Match B.C., and the Ministry of
              Health may use the EHPR to initiate contact if/when assistance is required.
              Registration in the EHPR does not guarantee that you will be contacted for deployment.
            </p>
            <p className='mb-4'>
              <b>
                You will be required to undergo a criminal record check or criminal record check
                verification under the <i>Criminal Records Review Act</i> prior to any deployment.
                Individuals who forgo the criminal record check or criminal record check
                verification process will not be eligible for deployment and may be removed from
                this registry.
              </b>
            </p>
            <p className='mb-4'>
              Your personal information is being collected in compliance with BC privacy legislation
              under sections 26(c) and (e) of the{' '}
              <i>Freedom of Information and Protection of Privacy Act.</i> Your information will be
              shared with the Ministry of Health, Health Match BC and health authorities, to support
              B.C.’s health emergency response.
            </p>

            <p className='font-bold'>
              If you encounter problems completing this form or if you have any questions about our
              collection or use of personal information, please email your inquiries to &nbsp;
              <ExternalLink href='mailto:EHPRQuestions@gov.bc.ca'>
                EHPRQuestions@gov.bc.ca
              </ExternalLink>
              .
            </p>
          </section>

          <div className='bg-white rounded' ref={formRef}>
            <div className='p-4 border-b mb-5'>
              <Stepper formSteps={FORM_STEPS} step={step} />
            </div>

            <Form />
          </div>
        </div>
      </div>
    </>
  );
};

export default Submission;
