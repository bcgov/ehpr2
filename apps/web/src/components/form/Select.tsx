import { Label } from './Label';
import { HeadlessList } from './HeadlessList';

export interface OptionType {
  label: string;
  value: string;
  disabled?: boolean;
  hidden?: boolean;
}

export interface SelectProps {
  id: string;
  options: OptionType[];
  label?: string;
  menuPlacement?: 'bottom' | 'top';
  isDisabled?: boolean;
}

export interface ValueProps {
  id: string;
  name: string;
}

export interface BasicSelectProps extends SelectProps {
  value: string;
  onChange: (value: string) => void;
}

export interface MultiSelectProps extends SelectProps {
  value: Array<ValueProps>;
  onChange: (value: Array<OptionType>) => void;
}

export const BasicSelect = (props: BasicSelectProps) => {
  const { id, value, label, options, onChange, menuPlacement, isDisabled } = props;

  return (
    <>
      <SelectLabel id={id} label={label} />
      <HeadlessList
        id={id}
        options={options}
        value={value}
        onChange={onChange}
        menuPlacement={menuPlacement}
        isDisabled={isDisabled}
      />
    </>
  );
};

export const MultiSelect2 = (props: MultiSelectProps) => {
  const { id, value, label, options, onChange, menuPlacement } = props;

  const transformSelectedToFormik = (value: ValueProps[]): OptionType[] => {
    return value.map(item => ({ value: item.id, label: item.name }));
  };

  return (
    <div>
      <SelectLabel id={id} label={label} />
      <HeadlessList
        isMulti
        id={id}
        options={options}
        value={transformSelectedToFormik(value)}
        onChange={onChange}
        menuPlacement={menuPlacement}
        isDisabled={false}
      />
    </div>
  );
};

const SelectLabel = ({ id, label }: { id: string; label?: string }) => {
  return (
    <>
      {label && (
        <div className='mb-2'>
          <Label htmlFor={id}>{label}</Label>
        </div>
      )}
    </>
  );
};

export const Option: React.FC<OptionType> = ({ label, value, disabled, hidden }) => {
  return (
    <option value={value} key={value} disabled={disabled} hidden={hidden}>
      {label}
    </option>
  );
};
