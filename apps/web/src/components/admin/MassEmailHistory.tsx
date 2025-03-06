import dayjs from 'dayjs';
import { downloadMassEmailHistory } from '@services';
import { Button } from '../Button';
import { MassEmailHistoryTable } from './MassEmailHistoryTable';
import { downloadAsCsv } from '@util';

export const MassEmailHistory = () => {
  const downloadHistory = async () => {
    const data = await downloadMassEmailHistory();
    if (data) {
      const filename = `ehpr-mass-email-history-${dayjs().format('YYYY-MM-DD')}.csv`;
      downloadAsCsv(filename, data);
    }
  };

  return (
    <div>
      <div className='flex justify-end w-full mb-5'>
        <Button variant='primary' onClick={downloadHistory}>
          Download
        </Button>
      </div>
      <MassEmailHistoryTable />
    </div>
  );
};
