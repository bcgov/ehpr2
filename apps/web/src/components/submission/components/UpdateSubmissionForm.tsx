import { createValidator } from 'class-validator-formik';
import { Formik, FormikProps, Form as FormikForm } from 'formik';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import {
  ContactInformationDTO,
  PersonalInformationDTO,
  StatusUpdateDTO,
  UpdateSubmissionDTO,
  UpdatePreferencesInformationDTO,
} from '@ehpr/common';
import { updateSubmission } from '@services';
import { Button, Field, Radio } from '@components';
import { DatePickerField } from '../../form/DatePickerField';
import UpdateSubmissionHeader from '../../update/UpdateSubmissionHeader';

interface UpdateSubmissionFormProps {
  email: string;
  code: string;
}

export const UpdateSubmissionForm = ({ email, code }: UpdateSubmissionFormProps) => {
  const { push } = useRouter();

  const formikRef = useRef<FormikProps<UpdateSubmissionDTO>>(null);

  const initialValues: UpdateSubmissionDTO = {
    personalInformation: new PersonalInformationDTO(),
    contactInformation: new ContactInformationDTO(),
    preferencesInformation: new UpdatePreferencesInformationDTO(),
    status: new StatusUpdateDTO(),
  };
  initialValues.contactInformation.email = email;

  const validator = createValidator(UpdateSubmissionDTO);

  const submit = async (values: UpdateSubmissionDTO) => {
    if (!values.status.deployed) {
      values.status.startDate = undefined;
      values.status.endDate = undefined;
    }
    updateSubmission(code, values).then(result => {
      push({
        pathname: 'update-submission/confirmation',
        query: { id: result.confirmationId },
      });
    });
  };

  return (
    <div className=''>
      <div className='w-full text-center pt-10 text-3xl text-bc-blue-primary'>
        Update Your EHPR Registration
      </div>
      <UpdateSubmissionHeader />
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validate={validator}
        onSubmit={submit}
      >
        {({ isSubmitting, values, errors, isValid }) => (
          <FormikForm>
            <div className='pt-10 pb-5'>
              Registration ID: <b>{code}</b>
            </div>
            <div className='py-3'>
              <Field name='contactInformation.email' label='Email Address' type='email' />
            </div>
            <div className='flex flex-col gap-5 py-3'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='md:col-span-1'>
                  <Field name='personalInformation.firstName' label='First Name' type='text' />
                </div>
                <div className='md:col-span-1'>
                  <Field name='personalInformation.lastName' label='Last Name' type='text' />
                </div>
              </div>
            </div>
            <div className='py-3'>
              <Field
                name='personalInformation.postalCode'
                label='Postal Code'
                description='Format: A1A 1A1'
                type='text'
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 py-3'>
              <div className='md:col-span-2'>
                <Field
                  name='contactInformation.primaryPhone'
                  label='Primary Phone Number'
                  type='text'
                  description='(xxx xxx xxxx)'
                />
              </div>
              <div className='md:col-span-1 mt-6'>
                <Field
                  name='contactInformation.primaryPhoneExt'
                  label='Ext. (optional)'
                  type='text'
                  disabled={
                    !values.contactInformation.primaryPhone ||
                    !!errors.contactInformation?.primaryPhone
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 py-3'>
              <div className='md:col-span-2'>
                <Field
                  name='contactInformation.secondaryPhone'
                  label='Secondary Phone Number (optional)'
                  type='text'
                  description='(xxx xxx xxxx)'
                />
              </div>
              <div className='md:col-span-1 mt-6'>
                <Field
                  name='scontactInformation.econdaryPhoneExt'
                  label='Ext. (optional)'
                  type='text'
                  disabled={
                    !values.contactInformation.secondaryPhone ||
                    !!errors.contactInformation?.secondaryPhone
                  }
                />
              </div>
            </div>
            <div className='mt-2 pt-3'>
              <Radio.Boolean name='status.interested' legend='Are you still interested in EHPR?' />
            </div>
            <div className='py-3'>
              <Radio.Boolean
                name='preferencesInformation.hasExperienceWithIndigenousCommunity'
                legend='Do you have experience working with Indigenous communities?'
              />
            </div>
            <div className='py-3'>
              <Radio.Boolean
                name='preferencesInformation.hasExperienceWithRemoteRuralCommunity'
                legend='Do you have experience working in rural/remote communities?'
              />
            </div>
            <div className='py-3'>
              <Radio.Boolean
                name='preferencesInformation.completedSanyasIndigenousCulturalSafetyTraining'
                legend="Have you completed the San'yas Indigenous Cultural Safety Training?"
              />
            </div>

            <div className='py-3'>
              <Radio.Boolean name='status.deployed' legend='Are you currently deployed?' />
            </div>
            {values.status.deployed && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='md:col-span-1'>
                  <DatePickerField name='status.startDate' label='Start Date' format='yyyy-MM-dd' />
                </div>
                <div className='md:col-span-1'>
                  <DatePickerField
                    name='status.endDate'
                    label='End Date(optional)'
                    format='yyyy-MM-dd'
                  />
                </div>
              </div>
            )}
            <div className='flex justify-center my-12'>
              <Button
                variant='primary'
                disabled={isSubmitting || !isValid || !values.personalInformation.firstName}
                loading={isSubmitting}
                type='submit'
              >
                Submit
              </Button>
            </div>
          </FormikForm>
        )}
      </Formik>
    </div>
  );
};
