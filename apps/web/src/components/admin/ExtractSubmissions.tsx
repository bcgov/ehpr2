import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Checkbox,
  FieldProps,
  MultiSelect,
  OptionType,
  Field,
  useAuthContext,
} from '@components';

import { extractSubmissions } from '@services';
import { Formik, Form as FormikForm } from 'formik';
import { getHas, getSpecialtiesByStreamId, isMoh } from '@ehpr/common';
import { streamOptions } from '../submission/validation/credential';

export interface FetchSubmissionsRequest {
  anywhereOnly: boolean;
  stream: string[];
  specialties: string[];
  subspecilaties: string[];
  location: string[];
}

export const ExtractSubmissions = () => {
  const { user: loggedUser } = useAuthContext();

  const downloadSubmissions = async (values: FetchSubmissionsRequest) => {
    const data = await extractSubmissions(values);
    if (data) {
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `ehpr-submissions-${dayjs().format('YYYY-MM-DD')}.csv`;
      link.href = url;
      link.click();
    }
  };
  const mapSubSpecialtiesFromStream = (streams: any[]): OptionType[] => {
    const subspecialties: OptionType[] = [];
    streams.forEach(stream => {
      let s = getSpecialtiesByStreamId(stream.id);
      s.forEach(specialty => {
        specialty.subspecialties.forEach(subspecialty => {
          subspecialties.push({
            label: subspecialty,
            value: subspecialty,
          });
        });
      });
    });
    return subspecialties;
  };
  const mapSpecialtiesFromStream = (streams: any[]): OptionType[] => {
    const specialties: OptionType[] = [];
    streams.forEach(stream => {
      let s = getSpecialtiesByStreamId(stream.id);
      s.forEach(specialty => {
        specialties.push({
          label: specialty.name,
          value: specialty.id,
        });
      });
    });
    return specialties;
  };

  const HealthAuthorities = getHas().map(HA => ({ label: HA.name, value: HA.name }));

  return (
    <div className='w-full'>
      <p className='mb-2'>
        Extract and download all submission data in <b>CSV</b> format.
      </p>
      <Formik
        initialValues={{
          anywhereOnly: false,
          stream: [],
          specialties: [],
          subspecilaties: [],
          location: [],
        }}
        onSubmit={async (values, { setSubmitting }) => {
          downloadSubmissions(values);
          setSubmitting(false);
        }}
      >
        {({ values }) => {
          return (
            <div>
              <FormikForm>
                <div className='grid grid-flow-col grid-rows-3 gap-4 my-4'>
                  <Field name='stream'>
                    {({ field, form }: FieldProps) => (
                      <MultiSelect
                        label='Stream'
                        id={field.name}
                        options={(streamOptions || []).map(s => ({
                          ...s,
                          isDisabled: false,
                        }))}
                        value={field.value || streamOptions.find(s => s.value === field.value)}
                        onChange={value => {
                          form.setFieldValue(
                            field.name,
                            value.map((option: OptionType) => ({
                              id: option.value,
                              name: option.label,
                            })),
                          );
                        }}
                      />
                    )}
                  </Field>
                  <Field name='specialties'>
                    {({ field, form }: FieldProps) => (
                      <MultiSelect
                        id={field.name}
                        value={field.value}
                        label='Specialties'
                        onChange={value => {
                          form.setFieldValue(
                            field.name,
                            value.map((option: OptionType) => ({
                              id: option.value,
                              name: option.label,
                            })),
                          );
                        }}
                        options={mapSpecialtiesFromStream(values.stream || [])}
                      />
                    )}
                  </Field>
                  <Field name='subspecialties'>
                    {({ field, form }: FieldProps) => (
                      <MultiSelect
                        id={field.name}
                        value={field.value}
                        label='Sub-Specialties'
                        onChange={value => {
                          form.setFieldValue(
                            field.name,
                            value.map((option: OptionType) => ({
                              id: option.value,
                              name: option.label,
                            })),
                          );
                        }}
                        options={mapSubSpecialtiesFromStream(values.stream || [])}
                      />
                    )}
                  </Field>
                  {isMoh(loggedUser?.email) && (
                    <Field name='location'>
                      {({ field, form }: FieldProps) => (
                        <MultiSelect
                          label='Health Authority'
                          id={field.name}
                          options={(HealthAuthorities || []).map(s => ({
                            ...s,
                            isDisabled: false,
                          }))}
                          value={field.value}
                          onChange={value => {
                            form.setFieldValue(
                              field.name,
                              value.map((option: OptionType) => ({
                                id: option.value,
                                name: option.label,
                              })),
                            );
                          }}
                        />
                      )}
                    </Field>
                  )}
                  <Checkbox
                    label={`Only include applicants who are willing to work anywhere`}
                    name='anywhereOnly'
                  />
                </div>
                <Button variant='primary' type='submit'>
                  <FontAwesomeIcon icon={faFileDownload} size='1x' className='mr-2' />
                  <span>Extract Submissions</span>
                </Button>
              </FormikForm>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};
