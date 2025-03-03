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
import {
  Authorities,
  getAuthorityByEmail,
  getHas,
  getLhasbyHaId,
  getSpecialtiesByStreamId,
  getSpecialtyById,
  getStreams,
  isMoh,
  Lha,
} from '@ehpr/common';
import { employmentOptions, streamOptions } from '../submission/validation/credential';
import _ from 'lodash';

export interface FetchSubmissionsRequest {
  anywhereOnly: boolean;
  stream: string[];
  specialties: string[];
  subspecialties: string[];
  authorities: string[];
  locations: string[];
  registeredOnly: boolean;
  currentEmployment: string[];
}

const HealthAuthorities = Object.values(Authorities).map(ha => ({
  label: ha.name,
  value: ha.name,
}));

const getSpecialties = (streams: string[]) => {
  return streams.filter(Boolean).map(getSpecialtiesByStreamId).flat();
};
const getSpecialtyOptions = (streams: string[] = []): OptionType[] =>
  getSpecialties(streams).map(s => ({
    label: s.name,
    value: s.id,
  }));

const getSubspecialties = (specialties: string[]) =>
  _.uniq(
    specialties
      .filter(Boolean)
      .map(getSpecialtyById)
      .map(s => s.subspecialties)
      .flat(),
  );

const getSubspecialtyOptions = (specialties: string[] = []): OptionType[] =>
  getSubspecialties(specialties).map(s => ({
    label: s,
    value: s,
  }));

const getCommunities = (authorities: string[]): Lha[] => {
  return authorities
    .filter(Boolean)
    .map(ha => Object.values(Authorities).find(e => e.name === ha)?.region)
    .filter(Boolean)
    .map(region => getHas().find(ha => ha.name == region))
    .filter(Boolean)
    .map(ha => getLhasbyHaId(ha!.id))
    .flat();
};

const getCommunityOptions = (authorities: string[]) =>
  getCommunities(authorities).map(ha => ({
    label: ha.name,
    value: ha.id,
  }));

const filterLocations = (communities: string[], authorities: string[]): string[] => {
  const allCommunities = getCommunities(authorities);
  return communities.filter(lhaId => allCommunities.some(lha => lha.id === lhaId));
};

const filterSpecialties = (specialties: string[], streams: string[]): string[] => {
  const allSpecialties = getSpecialties(streams);
  return specialties.filter(s => allSpecialties.some(a => a.id === s));
};

const filterSubspecialties = (subspecialties: string[], specialties: string[]) => {
  const allSubspecialties = getSubspecialties(specialties);
  return subspecialties.filter(s => allSubspecialties.includes(s));
};

export const ExtractSubmissions = () => {
  const { user: loggedUser } = useAuthContext();
  const authority = getAuthorityByEmail(loggedUser?.email);

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

  const initialValues: FetchSubmissionsRequest = {
    anywhereOnly: false,
    stream: [],
    specialties: [],
    subspecialties: [],
    authorities: isMoh(loggedUser?.email) || !authority ? [] : [authority.name],
    locations: [],
    registeredOnly: true,
    currentEmployment: [],
  };

  return (
    <div className='w-full'>
      <p className='mb-2'>
        Extract and download all submission data in <b>CSV</b> format.
      </p>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting }) => {
          downloadSubmissions(values);
          setSubmitting(false);
        }}
      >
        {({ values }) => {
          return (
            <div>
              <FormikForm>
                {/* <div className='grid grid-flow-row grid-cols-2 gap-4'> */}
                <div className='flex flex-row flex-wrap justify-start gap-4 my-8'>
                  <div className='flex flex-col gap-4 min-w-[480px] max-w-[500px] mb-4'>
                    <Field name='stream'>
                      {({ field, form }: FieldProps) => (
                        <MultiSelect
                          label='Stream'
                          id={field.name}
                          options={(streamOptions || []).map(s => ({
                            ...s,
                            isDisabled: false,
                          }))}
                          value={getStreams().filter(s => field.value.includes(s.id))}
                          onChange={value => {
                            const streams = value.map((option: OptionType) => option.value);
                            form.setFieldValue(field.name, streams);
                            form.setFieldValue(
                              'specialties',
                              filterSpecialties(values.specialties, streams),
                            );
                          }}
                        />
                      )}
                    </Field>
                    <Field name='specialties'>
                      {({ field, form }: FieldProps) => (
                        <MultiSelect
                          id={field.name}
                          value={getSpecialties(values.stream).filter(o =>
                            field.value.includes(o.id),
                          )}
                          label='Specialties'
                          onChange={value => {
                            const specialties = value.map((option: OptionType) => option.value);
                            form.setFieldValue(field.name, specialties);
                            form.setFieldValue(
                              'subspecialties',
                              filterSubspecialties(values.subspecialties, specialties),
                            );
                          }}
                          options={getSpecialtyOptions(values.stream)}
                        />
                      )}
                    </Field>
                    <Field name='subspecialties'>
                      {({ field, form }: FieldProps) => (
                        <MultiSelect
                          id={field.name}
                          value={getSubspecialties(values.specialties)
                            .filter(o => field.value?.includes(o))
                            .map(s => ({ id: s, name: s }))}
                          label='Sub-Specialties'
                          onChange={value => {
                            form.setFieldValue(
                              field.name,
                              value.map((option: OptionType) => option.value),
                            );
                          }}
                          options={getSubspecialtyOptions(values.specialties)}
                        />
                      )}
                    </Field>
                  </div>
                  <div className='flex flex-col gap-4 min-w-[480px] max-w-[500px]'>
                    <Checkbox
                      label={`Only include applicants who are willing to work anywhere`}
                      name='anywhereOnly'
                    />
                    {!values.anywhereOnly && isMoh(loggedUser?.email) && (
                      <Field name='authorities'>
                        {({ field, form }: FieldProps) => (
                          <MultiSelect
                            label='Health Authority'
                            id={field.name}
                            options={HealthAuthorities}
                            value={HealthAuthorities.filter(ha =>
                              field.value.includes(ha.value),
                            ).map(ha => ({ id: ha.value, name: ha.label }))}
                            onChange={value => {
                              const authorities = value.map((option: OptionType) => option.value);
                              form.setFieldValue(field.name, authorities);
                              form.setFieldValue(
                                'locations',
                                filterLocations(values.locations, authorities),
                              );
                            }}
                          />
                        )}
                      </Field>
                    )}
                    {!values.anywhereOnly && (
                      <Field name='locations'>
                        {({ field, form }: FieldProps) => (
                          <MultiSelect
                            label='Communities'
                            id={field.name}
                            options={getCommunityOptions(values.authorities)}
                            value={getCommunities(values.authorities).filter(ha =>
                              field.value.includes(ha.id),
                            )}
                            onChange={value => {
                              form.setFieldValue(
                                field.name,
                                value.map((option: OptionType) => option.value),
                              );
                            }}
                          />
                        )}
                      </Field>
                    )}
                    <Checkbox label={`Only include registered applicants`} name='registeredOnly' />
                    <Field name='currentEmployment'>
                      {({ field, form }: FieldProps) => (
                        <MultiSelect
                          label='Employment Status'
                          id={field.name}
                          options={employmentOptions}
                          value={employmentOptions
                            .filter(e => field.value.includes(e.value))
                            .map(e => ({ id: e.value, name: e.label }))}
                          onChange={value => {
                            form.setFieldValue(
                              field.name,
                              value.map((option: OptionType) => option.value),
                            );
                          }}
                        />
                      )}
                    </Field>
                  </div>
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
