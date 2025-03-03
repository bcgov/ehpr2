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
  label: string;
  description?: string;
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
  const { id, value, label, options, onChange, menuPlacement, isDisabled, description } = props;

  return (
    <HeadlessList
      id={id}
      options={options}
      value={value}
      onChange={onChange}
      menuPlacement={menuPlacement}
      isDisabled={isDisabled}
      description={description}
      label={label}
    />
  );
};

export const MultiSelect = (props: MultiSelectProps) => {
  const { id, value, options, onChange, menuPlacement, label, description, isDisabled } = props;

  const transformSelectedToFormik = (value: ValueProps[]): OptionType[] => {
    if (!Array.isArray(value)) {
      return value;
    }
    return value
      .filter(v => options.some(o => o.value === v.id))
      .map(item => ({ value: item.id, label: item.name }));
  };

  return (
    <HeadlessList
      isMulti
      id={id}
      options={options}
      value={transformSelectedToFormik(value)}
      onChange={onChange}
      menuPlacement={menuPlacement}
      isDisabled={isDisabled}
      description={description}
      label={label}
    />
  );
};

export const Option: React.FC<OptionType> = ({ label, value, disabled, hidden }) => {
  return (
    <option value={value} key={value} disabled={disabled} hidden={hidden}>
      {label}
    </option>
  );
};
