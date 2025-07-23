import { DEFAULT_PAGE_SIZE } from '@components';
import { PageOptions, Pagination } from '../Pagination';
import { useState } from 'react';
import { useMassEmailHistory } from '@hooks';
import dayjs from 'dayjs';
import { MassEmailRecord } from '@ehpr/common';
import { SimepleModal } from '../SimpleModal';
import { RecipientTable } from './RecipientTable';
import { ErrorTable } from './ErrorTable';

const getRecipientsCell = (record: MassEmailRecord, onClick: (record: MassEmailRecord) => void) => {
  const count = record.recipients?.length ?? 0;

  if (!count) {
    return 'No recipients';
  }

  const text = `${count} recipients`;
  return (
    <div className='flex flex-row gap-2'>
      <button className='border p-1 px-2 rounded' onClick={() => onClick(record)}>
        {text}
      </button>
    </div>
  );
};

const getErrorsCell = (record: MassEmailRecord, onClick: (record: MassEmailRecord) => void) => {
  const count = record.errors?.length ?? 0;

  if (!count) {
    return 'No errors';
  }

  const text = `${count} errors`;
  return (
    <div className='flex flex-row gap-2'>
      <button className='border p-1 px-2 rounded' onClick={() => onClick(record)}>
        {text}
      </button>
    </div>
  );
};

export const MassEmailHistoryTable = () => {
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);

  const [recipientListOpen, setRecipientListOpen] = useState(false);
  const [errorListOpen, setErrorListOpen] = useState(false);
  const [record, setRecord] = useState<MassEmailRecord>();

  const { data } = useMassEmailHistory({ limit, skip: (pageIndex - 1) * DEFAULT_PAGE_SIZE });

  const handlePageOptions = ({ pageIndex: pgIndex, pageSize: pgSize }: PageOptions) => {
    if (pgSize !== limit) {
      setLimit(pgSize);
      setPageIndex(1);
    } else {
      setPageIndex(pgIndex);
    }
  };

  const showRecipientList = (record: MassEmailRecord) => {
    setRecord(record);
    setRecipientListOpen(true);
  };

  const showErrors = (record: MassEmailRecord) => {
    setRecord(record);
    setErrorListOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkEmptyObject = (obj: Record<string, any> | undefined) => {
    if (obj === undefined || obj === null) return true;
    for (const i in obj) return false;
    return true;
  };

  return (
    <div className='h-full'>
      <Pagination
        pageOptions={{ pageIndex, pageSize: limit, total: data?.total ?? 0 }}
        onChange={handlePageOptions}
      />
      <table className='table-auto w-full text-left'>
        <thead>
          <tr className='border-b-2 bg-bcLightGray border-yellow-300 text-sm'>
            <th className='px-5 py-4' scope='col'>
              Date
            </th>
            <th className='px-5 py-4' scope='col'>
              Health Authority
            </th>
            <th className='px-5 py-4' scope='col'>
              Sender
            </th>
            <th className='px-5 py-4' scope='col'>
              Recipients
            </th>
            <th className='px-5 py-4' scope='col'>
              Errors
            </th>
          </tr>
        </thead>
        <tbody className='text-sm'>
          {!checkEmptyObject(data?.data) &&
            data?.data.map(record => (
              <tr key={record.id} className='border border-bcLightGray'>
                <td className='px-5 py-3'>
                  {dayjs(record.createdDate).format('MMM D, YYYY h:mm A')}
                </td>
                <td className='px-5 py-3'>{record.user.ha?.name}</td>
                <td className='px-5 py-3'>{record.user.name}</td>
                <td className='px-5 py-3'>{getRecipientsCell(record, showRecipientList)}</td>
                <td className='px-5 py-3'>{getErrorsCell(record, showErrors)}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <SimepleModal
        open={(recipientListOpen || errorListOpen) && !!record}
        title={recipientListOpen ? 'Recipients' : 'Errors'}
        onClose={() => {
          setRecipientListOpen(false);
          setErrorListOpen(false);
          setRecord(undefined);
        }}
      >
        {recipientListOpen && <RecipientTable recipients={record?.recipients} />}
        {errorListOpen && <ErrorTable errors={record?.errors} />}
      </SimepleModal>
    </div>
  );
};
