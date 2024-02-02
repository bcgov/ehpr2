import { useEffect, useState } from 'react';
import { EmailData, Specialty } from '@constants';
import { RegistrantFilterDTO, RegistrantRO } from '@ehpr/common';
import { getRegistrants } from '@services';
import { Spinner } from '../Spinner';
import { AdminSearch } from './AdminSearch';
import { Pagination } from '../Pagination';
import { GeneralCheckbox } from '../general';
import { Button } from '../Button';
import { EmailCampaign, useEmailContext } from '../email';

interface SelectedPages {
  page: number;
  selected: boolean;
  ids: string[];
}
interface FilterOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
  skip?: number;
  take?: number;
  limit?: number;
}

interface PageOptions {
  pageIndex: number;
  pageSize: number;
}

export const DEFAULT_PAGE_SIZE = 10;

export const AdminRegistrantsTable = () => {
  const { emails, setEmails } = useEmailContext();
  const [registrants, setRegistrants] = useState<RegistrantRO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<RegistrantFilterDTO | undefined>();
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);

  // pagination
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  // save data between pages, determines which pages were checked for 'Select Page'
  const [selectedPages, setSelectedPages] = useState<SelectedPages[]>([]);
  const totalPages = Math.ceil(total / limit);

  // used for page refreshes
  useEffect(() => {
    const skip = (pageIndex - 1) * limit;
    const options: FilterOptions = {
      limit,
      skip,
      ...filters,
    };
    // remove any selected page entries that no longer exist due to page size/ limit changes, to prevent duplicate entries
    setSelectedPages(prev => prev.filter(p => p.page <= totalPages));
    searchRegistrants(options).then(data => data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, pageIndex]);

  const searchRegistrants = async (filters: RegistrantFilterDTO) => {
    setLoading(true);
    getRegistrants(filters).then(({ data, count }) => {
      if (data) {
        const updatedData = data.map(item => {
          // to save state between pagination changes and add checked field to object
          // if in email state, the item will already be 'checked'
          // can have duplicate emails, need to check by user id
          const isChecked = emails.some(({ id }) => id === item.id);
          return { ...item, checked: isChecked };
        });

        setRegistrants(updatedData);
        setTotal(count);

        if (count < limit) {
          setPageIndex(1);
        }
      }
      setLoading(false);
    });
  };

  // used for search inputs
  const search = async (filters: RegistrantFilterDTO, searchLimit: number) => {
    const options: FilterOptions = { ...filters, limit: searchLimit };
    setLimit(searchLimit);
    setPageIndex(1);
    setFilters(filters);
    await searchRegistrants(options);
  };

  // pagination page options
  const handlePageOptions = ({ pageIndex: pgIndex, pageSize: pgSize }: PageOptions) => {
    if (pgSize !== limit) {
      setLimit(pgSize);
      setPageIndex(1);
    } else {
      setPageIndex(pgIndex);
    }
  };

  // handle multiple specialties
  const displaySpecialties = (specialties: string | string[]) => {
    if (Array.isArray(specialties)) {
      return specialties.map(s => Specialty[s as keyof typeof Specialty]).join(', ');
    } else {
      return Specialty[specialties as keyof typeof Specialty];
    }
  };

  // check for checkbox changes
  const handleCheckboxChange = (checked: boolean, value: string) => {
    if (value === 'all') {
      handleSelectAllCheckbox(checked);
    } else {
      handleSingleCheckBoxSelect(checked, value);
    }
  };

  // function for selecting individual rows
  const handleSingleCheckBoxSelect = (checked: boolean, id?: string) => {
    let updatedEmailsList: EmailData[] = [];
    if (id) {
      const registrantIndex = registrants?.findIndex(e => e.id === id);
      const registrantsCopy = [...registrants];

      // update registrants checked value
      if (registrantsCopy && registrantIndex !== -1 && registrantIndex !== undefined) {
        registrantsCopy[registrantIndex] = { ...registrantsCopy[registrantIndex], checked };
        setRegistrants(registrantsCopy);
      }

      const emailExists = emails.some(e => e.id === id);

      // update email list if email is checked
      if (checked && !emailExists) {
        updatedEmailsList = [
          ...emails,
          {
            id: registrantsCopy[registrantIndex].id,
            email: registrantsCopy[registrantIndex].email,
            name: `${registrantsCopy[registrantIndex].firstName} ${registrantsCopy[registrantIndex].lastName}`,
          },
        ];
        // filter out email if unchecked
      } else if (!checked && emailExists) {
        updatedEmailsList = emails.filter(e => e.id !== id);
      } else {
        updatedEmailsList = emails;
      }

      setEmails(updatedEmailsList);
    }
  };

  // function for Select All rows
  const handleSelectAllCheckbox = (checked: boolean) => {
    let updatedRegistrants: RegistrantRO[] | undefined = [];
    let updatedEmailsList: EmailData[] = [];

    if (checked) {
      const mappedRegistrantData = registrants.map(({ id, email, firstName, lastName }) => {
        return { id, email, name: `${firstName} ${lastName}` };
      });

      const selectedRegistrantIds = mappedRegistrantData.map(({ id }) => id);

      // save state of 'Select Page' checkbox between pagination changes, create an entry for each page
      setSelectedPages(prev => {
        const pageIndexExists = prev.some(p => p.page === pageIndex);
        // check if current page exists, which means 'Select Page' was selected, updated current entry
        // determines whether to update existing entry or create new one
        if (pageIndexExists) {
          return prev.map(p => {
            if (p.page === pageIndex) {
              return { ...p, ids: selectedRegistrantIds };
            }
            return p;
          });
        } else {
          return [...prev, { page: pageIndex, selected: true, ids: selectedRegistrantIds }];
        }
      });

      // avoid duplicate emails
      const filteredEmails = mappedRegistrantData.filter(({ id }) => {
        return selectedRegistrantIds.includes(id);
      });

      updatedEmailsList = [...emails, ...filteredEmails];
    } else {
      // handles select page checkbox
      // remove selected page entry and emails from selected page
      setSelectedPages(prev => prev.filter(p => p.page !== pageIndex));
      // keep already selected emails on separate pages
      updatedEmailsList = emails.filter(
        e => !selectedPages.find(p => p.page === pageIndex)?.ids.includes(e.id),
      );
    }

    updatedRegistrants = registrants?.map(registrant => ({
      ...registrant,
      checked,
    }));

    setRegistrants(updatedRegistrants ?? []);
    setEmails(updatedEmailsList);
  };

  const createMassEmailTemplate = () => {
    setShowTemplateModal(true);
  };

  return (
    <>
      <div className='flex flex-row items-center p-3 border border-bcLightGray rounded'>
        Filter:
        <AdminSearch search={search} />
      </div>
      <div className='flex justify-end w-full my-5'>
        {/* TODO: implement create mass email template/ button handler */}
        <Button variant='primary' onClick={createMassEmailTemplate} disabled={!emails.length}>
          Create Mass Email
        </Button>
      </div>
      <div className='overflow-x-auto border border-bcLightGray rounded mb-5'>
        <Pagination
          pageOptions={{ pageIndex, pageSize: limit, total }}
          onChange={handlePageOptions}
        />

        <table className='text-left w-full'>
          <thead className='whitespace-nowrap  text-bcBlack'>
            <tr className='border-b-2 bg-bcLightGray border-yellow-300 text-sm'>
              <th className='py-4 pl-6' scope='col'>
                <GeneralCheckbox
                  label='Select Page'
                  name='all'
                  value='all'
                  onChange={handleCheckboxChange}
                  checked={selectedPages.some(p => p.page === pageIndex && p.selected)}
                />
              </th>
              <th className='px-6' scope='col'>
                First Name
              </th>
              <th className='px-6' scope='col'>
                Last Name
              </th>
              <th className='px-6 ' scope='col'>
                Email
              </th>
              <th className='px-6' scope='col'>
                Specialization
              </th>
              <th className='px-6' scope='col'>
                Places Willing to Work
              </th>
            </tr>
          </thead>
          <tbody className='text-bcBlack'>
            {registrants && registrants.length > 0 ? (
              registrants.map((reg: RegistrantRO) => (
                <tr
                  key={reg.id}
                  className='text-left shadow-xs whitespace-nowrap text-sm border border-bcLightGray'
                >
                  <th className='py-4 pl-6' scope='col'>
                    <GeneralCheckbox
                      name={reg.email}
                      value={reg.id}
                      onChange={handleCheckboxChange}
                      checked={reg.checked}
                    />
                  </th>

                  <th className='py-4 px-6' scope='col'>
                    {reg.firstName}
                  </th>
                  <th className='px-6' scope='col'>
                    {reg.lastName}
                  </th>
                  <th className='px-6' scope='col'>
                    {reg.email}
                  </th>
                  <th className='px-6' scope='col'>
                    {displaySpecialties(reg.specialty)}
                  </th>
                  <th className='px-6' scope='col'>
                    {reg.deploymentLocations?.join(', ') || 'N/A'}
                  </th>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className='text-lg text-center shadow-xs whitespace-nowrap text-sm'>
                  No Registrants were founds
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          pageOptions={{ pageIndex, pageSize: limit, total }}
          onChange={handlePageOptions}
        />
      </div>
      {loading && (
        <div className='h-64'>
          <Spinner size='2x' />
        </div>
      )}

      {showTemplateModal && <EmailCampaign open={showTemplateModal} close={setShowTemplateModal} />}
    </>
  );
};
