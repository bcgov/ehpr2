import React, { Fragment, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ListboxButton, ListboxOptions, ListboxOption, Transition } from '@headlessui/react';

import { OptionType } from '@components';

type MultiItemListboxProps = {
  id: string;
  options: OptionType[];
  selected: OptionType[];
  handlePreviousSelect: (value: OptionType) => void;
  isDisabled?: boolean;
  menuPlacement?: 'bottom' | 'top';
};

const listboxStyles = (
  isDisabled: boolean | undefined,
  optionsLength: number,
  selectedLength?: number,
) => {
  const disabledStyles =
    isDisabled || optionsLength === 0
      ? 'bg-gray-300 '
      : 'border-b-2 border-black bg-gray-100 hover:border-gray-400';
  const heightStyle = selectedLength !== 0 ? '' : 'h-10';
  return `${disabledStyles} ${heightStyle}`;
};

export const MultiItemListbox = ({
  id,
  options,
  selected,
  isDisabled,
  menuPlacement,
  handlePreviousSelect,
}: MultiItemListboxProps) => {
  const commonStyles = listboxStyles(isDisabled, options.length, selected.length);

  const handleOptionRemove = useCallback(
    (option: OptionType, event: React.MouseEvent<SVGSVGElement>) => {
      event.stopPropagation();

      handlePreviousSelect(option);
    },
    [handlePreviousSelect],
  );

  return (
    <>
      <ListboxButton
        className={`${commonStyles} relative w-full cursor-default py-2 pl-3 pr-10 text-left
        focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2
      focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300
        `}
        id={id}
      >
        {Boolean(selected.length) ? (
          <div className='block'>
            {selected.map((option, index) => (
              <div key={index}>
                <div className='flex justify-between align-middle text-sm bg-gray-300 rounded p-1 my-0.5 mr-1 px-2'>
                  <p className='truncate'>{option.label}</p>
                  <FontAwesomeIcon
                    aria-label={`Remove ${option.label}`}
                    onClick={e => handleOptionRemove(option, e)}
                    icon={faTimes}
                    className='self-center hover:text-[#D8292F]'
                  />
                </div>
              </div>
            ))}
          </div>
        ) : isDisabled ? (
          ''
        ) : (
          'Select...'
        )}
        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
          <FontAwesomeIcon icon={faCaretDown} className='h-5 w-5 text-black ' aria-hidden='true' />
        </span>
      </ListboxButton>
      <Transition
        as={Fragment}
        leave='transition ease-in duration-100'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <ListboxOptions
          className={`${
            menuPlacement === 'top' ? 'top-0 -translate-y-full' : ''
          } z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none`}
        >
          {options.map(option => (
            <ListboxOption
              key={option.value}
              value={option}
              className='relative cursor-default select-none py-2 pr-4 pl-8 data-[active]:bg-gray-100 text-gray-900'
            >
              {({ selected }) => (
                <>
                  <span className='block truncate'>{option.label}</span>
                  {selected ? (
                    <span className='absolute inset-y-0 left-0 flex items-center pl-3'>
                      <FontAwesomeIcon icon={faCheck} className='w-3 h-3' aria-hidden={true} />
                    </span>
                  ) : null}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Transition>
    </>
  );
};

type SingleItemListboxProps = {
  id: string;
  options: OptionType[];
  selected: string;
  isDisabled?: boolean;
  menuPlacement?: 'bottom' | 'top';
};

export const SingleItemListbox = ({
  id,
  options,
  selected,
  isDisabled,
  menuPlacement,
}: SingleItemListboxProps) => {
  const getOption = useCallback(
    (value: string) => options.find(option => option.value === value),
    [options],
  );

  const displayText = useCallback(
    (value: string) => {
      if (!value) {
        return;
      }
      const option = getOption(value);
      return (option?.label || option?.value || '').toString();
    },
    [getOption],
  );

  const commonStyles = listboxStyles(isDisabled, options.length);

  return (
    <>
      <ListboxButton
        className={`${commonStyles} relative w-full cursor-default py-2 pl-3 pr-10 text-left
         focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300`}
        id={id}
      >
        {selected ? <span className='block truncate'>{displayText(selected)}</span> : 'Select...'}
        <span className='hover:text-gray-400 pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 '>
          <FontAwesomeIcon icon={faCaretDown} className='h-5 w-5 text-black ' aria-hidden='true' />
        </span>
      </ListboxButton>
      <Transition
        as={Fragment}
        leave='transition ease-in duration-100'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <ListboxOptions
          className={`${
            menuPlacement === 'top' ? 'top-0 -translate-y-full' : ''
          } z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none`}
        >
          {options.map(option => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className='relative cursor-default select-none py-2 pr-4 pl-3 data-[active]:bg-gray-100 text-gray-900'
            >
              <>
                <span className='block truncate'>{option.label || option.value}</span>
              </>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Transition>
    </>
  );
};
