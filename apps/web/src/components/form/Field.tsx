import classnames from 'classnames';
import { Error, Label, Description } from '@components';
import { Field as FormikField, useField, FieldAttributes } from 'formik';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FieldProps extends FieldAttributes<any> {
  name: string;
  label?: string | React.ReactNode;
  description?: string | React.ReactNode;
  disabled?: boolean;
  type?: string;
  min?: string | number | Date;
  validate?: (value: string) => string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: string | React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: React.ReactNode | ((props: any) => React.ReactNode);
  className?: string;
  maxLength?: number;
}

export const Field: React.FC<FieldProps> = props => {
  const {
    name,
    disabled,
    type,
    as,
    min,
    validate,
    component,
    className,
    maxLength,
    children,
    label,
    description,
  } = props;
  const [field, meta] = useField(name);

  return (
    <div>
      {/**This allows for components to control their own label and description */}
      {(label || description) && (
        <div className='mb-2'>
          {label && <Label htmlFor={name}>{label}</Label>}
          {description && <Description id={`${name}-description`}>{description}</Description>}
        </div>
      )}

      <FormikField
        id={name}
        aria-describedby={description ? `${name}-description` : null}
        className={
          className ??
          classnames(
            `w-full rounded-none bg-gray-100 block h-10
            border-b-2 border-bc-black pl-1 disabled:bg-bc-disabled`,
            {
              'border-red-500': meta.touched && meta.error,
            },
          )
        }
        min={min}
        validate={validate}
        disabled={disabled}
        as={as}
        type={type}
        maxLength={maxLength}
        component={component}
        {...field}
      >
        {children}
      </FormikField>

      <Error name={name} />
    </div>
  );
};
