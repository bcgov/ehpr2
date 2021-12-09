import React from 'react';
import { render, screen } from '@testing-library/react';
import { Credential } from '../../../../src/components/submission/components/Credential';
import {
  defaultSpecialtyValue,
  registrationStatusOptions,
  healthAuthorityOptions,
  employmentOptions,
} from '../../../../src/components/submission/validation/credential';
import * as formik from 'formik';

const mockSetFieldValue = jest.fn();
Object.defineProperty(formik, 'useFormikContext', () => ({ setFieldValue: mockSetFieldValue }));

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {
      step: '3',
    },
  }),
}));

describe('Credential', () => {
  it('should render', () => {
    const mock = jest.fn();
    const initialValues = {
      skillInformation: {
        stream: undefined,
        specialties: [defaultSpecialtyValue],
        currentEmployment: undefined,
      },
    };

    render(
      <formik.Formik initialValues={initialValues} onSubmit={mock}>
        <Credential />
      </formik.Formik>,
    );

    const headingElement = screen.getByRole('heading', { name: '3. Credential Information' });

    expect(headingElement).toBeInTheDocument();
  });

  it('should render the expected fields ', async () => {
    const mockSubmit = jest.fn();
    const initialValues = {
      skillInformation: {
        stream: undefined,
        specialties: [defaultSpecialtyValue],
        currentEmployment: undefined,
      },
    };

    render(
      <formik.Formik initialValues={initialValues} onSubmit={mockSubmit}>
        <Credential />
      </formik.Formik>,
    );

    expect(screen.getByRole('combobox', { name: 'Stream Type' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Main Speciality' })).toBeInTheDocument();
    registrationStatusOptions.forEach(label =>
      expect(screen.getByRole('radio', { name: label.label })).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('group', {
        name: 'Please select which best applied to your current registration status',
      }),
    ).toBeInTheDocument(),
      expect(
        screen.getByRole('textbox', {
          name: 'Please indicate registration number from your credentialing body',
        }),
      ).toBeInTheDocument();
    expect(
      screen.getByRole('group', {
        name: 'Please select which best applied to your current employment',
      }),
    ).toBeInTheDocument(),
      employmentOptions.forEach(label =>
        expect(screen.getByRole('radio', { name: label.label })).toBeInTheDocument(),
      );
    expect(
      screen.getByRole('combobox', {
        name: 'Main Speciality',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Subspecialty/Training')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Additional Comments (optional) 50 characters max' }),
    ).toBeInTheDocument();
  });

  it('should render health authority checkboxes when health authority employment is selected ', async () => {
    const mockSubmit = jest.fn();
    const initialValues = {
      skillInformation: {
        stream: undefined,
        specialties: [defaultSpecialtyValue],
        currentEmployment: 'healthSectorEmployed',
      },
    };

    render(
      <formik.Formik initialValues={initialValues} onSubmit={mockSubmit}>
        <Credential />
      </formik.Formik>,
    );

    healthAuthorityOptions.forEach(label =>
      expect(screen.getByRole('checkbox', { name: label.label })).toBeInTheDocument(),
    );
  });
});