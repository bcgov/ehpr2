import React from 'react';
import { Field, FieldProps } from 'formik';

interface CaptchaFieldProps {
  name: string;
  children: (onVerify: (isValid: boolean) => void) => React.ReactNode;
}

export const CaptchaField: React.FC<CaptchaFieldProps> = ({ name, children }) => {
  return (
    <Field name={name}>
      {({ field, form }: FieldProps) =>
        children((isValid: boolean) => {
          form.setFieldValue(field.name, isValid);
        })
      }
    </Field>
  );
};
