import { Recipient } from '@ehpr/common';

interface RecipientTableProps {
  recipients?: Recipient[];
}

export const RecipientTable = ({ recipients }: RecipientTableProps) => {
  return (
    <div className='px-2 my-4 overflow-y-scroll' style={{ maxHeight: '60vh' }}>
      <table className='table-auto w-full text-left'>
        <thead>
          <tr className='border-b-2 bg-bcLightGray border-yellow-300 text-sm'>
            <th className='py-3 px-5'>ID</th>
            <th className='py-3 px-5'>Email</th>
          </tr>
        </thead>
        <tbody className='text-sm'>
          {recipients?.map(r => (
            <tr key={r.id} className='border border-bcLightGray'>
              <td className='py-3 px-5'>{r.id.split('-')[0]}</td>
              <td className='py-3 px-5'>{r.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
