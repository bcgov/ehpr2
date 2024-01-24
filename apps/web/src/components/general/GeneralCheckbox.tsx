interface GeneralCheckboxProps {
  name: string;
  label?: string;
  value: string;
  onChange: ((checked: boolean, email?: string) => void) | ((checked: boolean) => void);
  checked?: boolean;
}
// generalized checkbox
// not tied to Formik
export const GeneralCheckbox = (props: GeneralCheckboxProps) => {
  const { name, label, value, onChange, checked } = props;

  const handleChange = (checked: boolean, email?: string) => {
    if (email) {
      onChange(checked, email);
    } else {
      onChange(checked);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      {label && (
        <label htmlFor={name} className='pb-2'>
          {label}
        </label>
      )}
      <input
        type='checkbox'
        id={name}
        name={name}
        checked={checked}
        onChange={e => handleChange(e?.target?.checked, value)}
        className='h-4 w-4 min-w-4'
      />
    </div>
  );
};
