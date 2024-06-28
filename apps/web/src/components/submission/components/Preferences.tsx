import {
  FormStepHeader,
  Radio,
  Disclosure,
  Checkbox,
  OptionType,
  Error,
  CheckboxArray,
  Field,
} from '@components';
import { BasicSelect } from '@components';
import { getLhasbyHaId, HaId } from '@ehpr/common';
import { FieldProps, useFormikContext } from 'formik';
import { useEffect, useRef } from 'react';
import { FormStepProps } from '.';
import { SubmissionType, healthAuthorityOptions } from '../validation';
import {
  deploymentDurationOptions,
  getHsdaOptions,
  getLhaOptions,
  haOptions,
  HaPdfSizeMap,
  placementOptions,
  deploymentTypeOptions,
  previousDeploymentOptions,
} from '../validation/preferences';
import { DatePickerField } from '../../form/DatePickerField';

export const Preferences: React.FC<FormStepProps> = () => {
  const { values, setFieldValue } = useFormikContext<SubmissionType>();
  const { deployAnywhere, hasPreviousDeployment } = values.preferencesInformation;

  const previousDeployAnywhere = useRef(deployAnywhere);
  const previoushasPreviousDeployment = useRef(hasPreviousDeployment);

  useEffect(() => {
    // only reset locations when deploy anywhere is changed (i.e. changed from true to false)
    // prevents resetting locations on component mount
    if (deployAnywhere !== previousDeployAnywhere.current) {
      setFieldValue('preferencesInformation.deploymentLocations', []);
    }
    previousDeployAnywhere.current = deployAnywhere;
  }, [deployAnywhere, setFieldValue]);

  useEffect(() => {
    // reset previous deployment fields on change (i.e from yes to no/unsure)
    if (hasPreviousDeployment !== previoushasPreviousDeployment.current) {
      setFieldValue('preferencesInformation.lastDeploymentDate', '');
      setFieldValue('preferencesInformation.lastDeployedHa', '');
    }
    previoushasPreviousDeployment.current = hasPreviousDeployment;
  }, [hasPreviousDeployment, setFieldValue]);

  return (
    <div className='flex flex-col gap-4'>
      <FormStepHeader>4. Employment Preferences</FormStepHeader>
      <Radio.Boolean
        name='preferencesInformation.deployAnywhere'
        legend='Are you willing to deploy anywhere in BC?'
        horizontal
      />
      {deployAnywhere === false ? (
        <fieldset>
          <legend className='text-gray-500 font-bold mb-2 text-base'>
            Indicate the locations you are willing to support (click on the drop-down in each region
            and select the locations)
          </legend>
          <DeploymentLocationSelector />
          <Error name='preferencesInformation.deploymentLocations' />
        </fieldset>
      ) : null}
      <CheckboxArray
        legend='Indicate the placement option(s) you are willing to support'
        name='preferencesInformation.placementOptions'
        options={placementOptions}
      />
      <Radio.Boolean
        legend='Have you received immunization training in the past five years?'
        name='preferencesInformation.hasImmunizationTraining'
      />
      <Radio
        name='preferencesInformation.deploymentDuration'
        legend='Indicate the maximum duration of deployment you are willing to support'
        options={deploymentDurationOptions}
      />
      <CheckboxArray
        legend='Indicate the type of deployment you are willing to support (select all that apply)'
        name='preferencesInformation.deploymentType'
        options={deploymentTypeOptions}
      />
      <Radio
        name='preferencesInformation.hasPreviousDeployment'
        legend='Have you previously been deployed from the EHPR?'
        options={previousDeploymentOptions}
      />
      {values.preferencesInformation.hasPreviousDeployment === 'yes' && (
        <>
          <div className='flex flex-row'>
            <DatePickerField
              name='preferencesInformation.lastDeploymentDate'
              label='Date of Last Deployment'
              format='yyyy-MM-dd'
              max={new Date()}
            />
          </div>
          <div className='flex flex-row'>
            <Field
              name={'preferencesInformation.lastDeployedHa'}
              label={'Last Deployed Health Authority'}
            >
              {({ field, form }: FieldProps) => (
                <BasicSelect
                  id={field.name}
                  value={
                    field.value || (healthAuthorityOptions || []).find(o => o.value === field.value)
                  }
                  options={(healthAuthorityOptions || []).map(o => ({
                    ...o,
                  }))}
                  onChange={value => form.setFieldValue(field.name, value)}
                  menuPlacement='bottom'
                />
              )}
            </Field>
          </div>
        </>
      )}
    </div>
  );
};

const DeploymentLocationSelector: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<SubmissionType>();

  const selectedDeploymentLocations = values.preferencesInformation.deploymentLocations ?? [];

  const currentlySelected = (haId: HaId) => {
    const lhas = getLhasbyHaId(haId);

    return lhas.filter(lha => values.preferencesInformation?.deploymentLocations?.includes(lha.id));
  };

  const allSelected = (haId: HaId) => {
    const lhas = getLhasbyHaId(haId);
    return currentlySelected(haId).length === lhas.length;
  };
  const allUnselected = (haId: HaId) => currentlySelected(haId).length === 0;

  const unselectAll = (haId: string) => {
    const lhas = getLhasbyHaId(haId);
    const filtereredDeploymentLocations = selectedDeploymentLocations.filter(
      location => !lhas.find(lha => lha.id === location),
    );
    setFieldValue('preferencesInformation.deploymentLocations', filtereredDeploymentLocations);
  };

  const selectAll = (haId: HaId) => {
    const newDeploymentLocations = [...selectedDeploymentLocations];
    const lhas = getLhasbyHaId(haId);
    // add current locations if they aren't already selected
    lhas.forEach((lha: { id: string }) => {
      if (!newDeploymentLocations.find(loc => loc === lha.id)) {
        newDeploymentLocations.push(lha.id);
      }
    });

    setFieldValue('preferencesInformation.deploymentLocations', newDeploymentLocations);
  };

  return (
    <div>
      {haOptions.map(({ value, label }) => (
        <div key={value} className='bg-bcLightGray rounded mb-4'>
          <Disclosure
            buttonText={
              <span className='font-bold text-black p-5'>
                {label} (
                <a
                  href={HaPdfSizeMap[value].url}
                  target='_blank'
                  rel='noreferrer'
                  className='font-bold text-bcBlueLink'
                  aria-label={`${label} map PDF`}
                >
                  PDF, {HaPdfSizeMap[value].size}MB
                </a>
                )
              </span>
            }
            content={
              <div className='p-5 pt-0'>
                <div className='mb-2'>
                  <button
                    type='button'
                    onClick={() => selectAll(value)}
                    className='text-bcBlueLink disabled:text-gray-500 font-bold'
                    disabled={allSelected(value)}
                  >
                    Select all
                  </button>{' '}
                  |{' '}
                  <button
                    type='button'
                    onClick={() => unselectAll(value)}
                    className='text-bcBlueLink disabled:text-gray-500 font-bold'
                    disabled={allUnselected(value)}
                  >
                    Un-select all
                  </button>
                </div>
                <div className='flex flex-col gap-5'>
                  {getHsdaOptions(value).map(({ value, label }) => (
                    <HsdaLocationSelector
                      key={value}
                      region={label}
                      lhaOptions={getLhaOptions(value)}
                    />
                  ))}
                </div>
              </div>
            }
          />
        </div>
      ))}
    </div>
  );
};

interface LocationListProps {
  region: string;
  lhaOptions: OptionType[];
}

const HsdaLocationSelector: React.FC<LocationListProps> = ({ region, lhaOptions }) => {
  return (
    <fieldset>
      <legend className='font-bold text-black mb-2 text-base'>{region}</legend>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border border-gray-400 rounded text-black bg-white'>
        {lhaOptions.map(location => (
          <Checkbox
            key={location.value}
            name={`preferencesInformation.deploymentLocations`}
            value={location.value}
            label={location.label}
          />
        ))}
      </div>
    </fieldset>
  );
};
