import { useEffect, useState } from 'react';
import { Listbox, Field, Label, Description } from '@headlessui/react';

import { OptionType } from '@components';
import { SingleItemListbox, MultiItemListbox } from './ListboxSelect';

export interface HeadlessListProps<T> {
  id: string;
  options: OptionType[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  isMulti?: boolean;
  menuPlacement?: 'bottom' | 'top';
  isDisabled?: boolean;
  label: string;
  description?: string;
}

export const HeadlessList = <T,>({
  id,
  options,
  value,
  onChange,
  className = '',
  isMulti = false,
  menuPlacement = 'bottom',
  isDisabled,
  label,
  description,
}: HeadlessListProps<T>) => {
  const [selected, setSelected] = useState<T | OptionType[]>(value);
  const currentlyDisabled = isDisabled || options?.length === 0;

  const onListBoxChange = (value: T) => {
    setSelected(value);
    onChange(value);
  };

  // Handles the removal of multi selected options when the icon next to it is clicked
  const handlePreviousSelect = (selectedOption: OptionType) => {
    setSelected(prevSelected => {
      if (!Array.isArray(prevSelected)) {
        return prevSelected;
      }

      const remainingOptions = prevSelected.filter(option => option.value !== selectedOption.value);

      onChange(remainingOptions as T);
      return remainingOptions;
    });
  };

  useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <Field>
      <div className='mb-2'>
        {label && (
          <Label className='block text-bcBlack text-base font-bold' htmlFor={id}>
            {label}
          </Label>
        )}
        {description && (
          <Description className='text-sm text-gray-500' id={`${id}-description`}>
            {description}
          </Description>
        )}
      </div>
      <div className={`w-full ${className}`}>
        <Listbox
          value={selected}
          onChange={onListBoxChange}
          multiple={isMulti}
          disabled={currentlyDisabled}
          by='value'
        >
          <div className='relative mt-1'>
            {isMulti ? (
              <MultiItemListbox
                id={id}
                options={options}
                selected={selected as OptionType[]}
                isDisabled={currentlyDisabled}
                menuPlacement={menuPlacement}
                handlePreviousSelect={handlePreviousSelect}
              />
            ) : (
              <SingleItemListbox
                id={id}
                options={options}
                selected={selected as string}
                isDisabled={currentlyDisabled}
                menuPlacement={menuPlacement}
              />
            )}
          </div>
        </Listbox>
      </div>
    </Field>
  );
};
