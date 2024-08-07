import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Credential } from '../../../../src/components/submission/components';
import {
  defaultSpecialtyValue,
  registrationStatusOptions,
  currentHealthAuthorityOptions,
  employmentOptions,
} from '../../../../src/components/submission/validation';
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
  it('should render', async () => {
    const mockSubmit = jest.fn();
    const initialValues = {
      credentialInformation: {
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

    const headingElement = await screen.findByRole('heading', {
      name: '3. Credentials Information',
    });

    expect(headingElement).toBeInTheDocument();
  });

  it('should render the expected fields ', async () => {
    const mockSubmit = jest.fn();
    const initialValues = {
      credentialInformation: {
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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Stream Type' })).toBeInTheDocument();
      registrationStatusOptions.forEach(label =>
        expect(screen.getByRole('radio', { name: label.label })).toBeInTheDocument(),
      );
      expect(
        screen.getByRole('group', {
          name: 'Select which best applies to your current registration status',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('group', {
          name: 'Select which best applies to your current employment status',
        }),
      ).toBeInTheDocument();
      employmentOptions.forEach(label =>
        expect(screen.getByRole('radio', { name: label.label })).toBeInTheDocument(),
      );
    });
  });

  it('should render health authority checkboxes when health authority employment is selected ', async () => {
    const mockSubmit = jest.fn();
    const initialValues = {
      credentialInformation: {
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

    await waitFor(() => {
      currentHealthAuthorityOptions.forEach(label =>
        expect(screen.getByRole('checkbox', { name: label.label })).toBeInTheDocument(),
      );
    });
  });
});
