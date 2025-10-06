import { Recipient } from '@ehpr/common';

interface RecipientTableProps {
  recipients?: Recipient[];
}

export const RecipientTable = ({ recipients }: RecipientTableProps) => {
  return (
    <div className='px-2 my-4 overflow-y-scroll' style={{ maxHeight: '60vh' }}>
      <table className='table-auto w-full text-left'>
        <thead>
          <tr className='border-b-2 bg-bc-light-gray border-yellow-300 text-sm'>
            <th className='py-3 px-5'>ID</th>
            <th className='py-3 px-5'>Email</th>
          </tr>
        </thead>
        <tbody className='text-sm'>
          {recipients?.map((r, index) => {
            if (typeof r === 'object')
              return (
                <tr key={r.id} className='border border-bc-light-gray'>
                  <td className='py-3 px-5'>{r.id.split('-')[0]}</td>
                  <td className='py-3 px-5'>{r.email}</td>
                </tr>
              );
            if (typeof r === 'string')
              return (
                <tr key={r + index} className='border border-bc-light-gray'>
                  <td className='py-3 px-5'>{r}</td>
                  <td className='py-3 px-5'>Legacy record before email was added</td>
                </tr>
              );
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
};
