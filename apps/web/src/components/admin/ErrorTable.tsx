import { GenericError } from '@ehpr/common';

interface ErrorTableProps {
  errors?: GenericError[];
}

export const ErrorTable = ({ errors }: ErrorTableProps) => {
  return (
    <div className='px-2 my-4 overflow-y-scroll' style={{ maxHeight: '60vh' }}>
      <table className='table-auto w-full text-left'>
        <thead>
          <tr className='border-b-2 bg-bc-light-gray border-yellow-300 text-sm'>
            <th className='py-3 px-5'>Error Type</th>
            <th className='py-3 px-5'>Recipient</th>
            <th className='py-3 px-5'>Error Message</th>
          </tr>
        </thead>
        <tbody className='text-sm'>
          {errors?.map(r => (
            <tr key={r.recipientId} className='border border-bc-light-gray'>
              <td className='py-3 px-5'>{r.errorType}</td>
              <td className='py-3 px-5'>{r.recipientId.split('-')[0]}</td>
              <td className='py-3 px-5'>{r.errorMessage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
