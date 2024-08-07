import React from 'react';
import { Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import { MultiSelect } from '@components';

describe('MultiSelect', () => {
  it('renders a select', () => {
    const mock = jest.fn();
    const testSelectName = 'input-id';
    const testOptions = [{ value: 'testValue', label: 'testLabel' }];

    render(
      <Formik initialValues={{ [testSelectName]: '' }} onSubmit={mock}>
        <MultiSelect
          label='TEST'
          value={[]}
          id={testSelectName}
          options={testOptions}
          onChange={() => {}}
        />
      </Formik>,
    );

    const selectElement = screen.getByRole('button');

    expect(selectElement).toBeInTheDocument();
  });

  it('renders a label element with the correct accessible association', () => {
    const mock = jest.fn();
    const selectName = 'selectName';
    const selectLabel = 'select label';
    const testOptions = [{ value: 'testValue', label: 'testLabel' }];

    render(
      <Formik initialValues={{ [selectName]: '' }} onSubmit={mock}>
        <MultiSelect
          id={selectName}
          label={selectLabel}
          options={testOptions}
          value={[{ id: 'testValue', name: 'testLabel' }]}
          onChange={() => {}}
        />
      </Formik>,
    );

    const labelElement = screen.getByText('select label');
    const selectElement = screen.getByRole('button');

    expect(labelElement).toBeInTheDocument();
    expect(selectElement).toHaveAccessibleName(selectLabel);
  });

  it('renders a description element with the proper accessible association', () => {
    const mock = jest.fn();
    const selectName = 'selectName';
    const selectLabel = 'select label';
    const selectDescription = 'field format description';

    render(
      <Formik initialValues={{ [selectName]: '' }} onSubmit={mock}>
        <MultiSelect
          label={selectLabel}
          description={selectDescription}
          id={selectName}
          value={[]}
          options={[]}
          onChange={() => {}}
        />
      </Formik>,
    );

    const selectElement = screen.getByRole('button');
    const descriptionElement = screen.getByText('field format description');

    expect(descriptionElement).toBeInTheDocument();
    expect(selectElement).toHaveAccessibleDescription(selectDescription);
  });
});
