import React, { useEffect, useState } from 'react';
import { RegistrantFilterDTO, isMoh, isPHC } from '@ehpr/common';
import { SearchInput } from '../SearchInput';
import { DEFAULT_PAGE_SIZE } from './AdminRegistrantsTable';
import { GeneralCheckbox } from '../general';
import { useAuthContext } from '../AuthProvider';

interface SearchInputProps {
  search: (filters: RegistrantFilterDTO, limit: number) => void;
}

// delay to reduce api call count
const QUERY_DELAY = 300;

export const AdminSearch = (props: SearchInputProps) => {
  const { user } = useAuthContext();
  const { search } = props;

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [anyRegion, setAnyRegion] = useState<boolean>(false);

  useEffect(() => {
    // This is to avoid extra API calls on initial render
    if (firstLoad) {
      setFirstLoad(false);
      return;
    }
    const timer = setTimeout(
      () => search({ firstName, lastName, email, anyRegion }, DEFAULT_PAGE_SIZE),
      QUERY_DELAY,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName, email, anyRegion]);

  const handleAnyRegionChange = () => {
    setAnyRegion(prev => !prev);
  };

  useEffect(() => {
    if (isPHC(user?.email)) {
      setAnyRegion(true);
    }
  }, [user]);

  return (
    <>
      <div className='relative bg-white z-10 flex lg:flex-row md:flex-col sm:flex-col items-center pl-5'>
        {/* first name search input */}
        <SearchInput
          name='firstName'
          value={firstName}
          onChange={setFirstName}
          placeholder='First name'
        />
        {/* last name search input */}
        <SearchInput
          name='lastName'
          value={lastName}
          onChange={setLastName}
          placeholder='Last name'
        />
        {/* email search input */}
        <SearchInput name='email' value={email} onChange={setEmail} placeholder='Email' />
      </div>
      {/* no need to show this for MoH users, as they can see all registrants */}
      {!isMoh(user?.email) && (
        <div className='flex flex-row text-sm w-full ml-2'>
          <GeneralCheckbox
            name='any-region'
            value='any-region'
            onChange={handleAnyRegionChange}
            checked={anyRegion}
          />
          <label htmlFor={'any-region'} className='pl-2'>
            Show Any Region
          </label>
        </div>
      )}
    </>
  );
};
