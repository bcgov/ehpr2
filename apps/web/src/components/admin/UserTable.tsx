import _ from 'lodash';
import dayjs from 'dayjs';
import { Role, User } from '@ehpr/common';
import { Button, useAdminContext } from '@components';
import { useAuthContext } from '../AuthProvider';

export const UserTable = () => {
  const { user: loggedUser } = useAuthContext();
  const { users, approve, revoke } = useAdminContext();

  const getButton = (user: User) => {
    if (user.id === loggedUser?.id) {
      return null;
    }
    if (user.role === Role.Pending || user.revokedDate) {
      return (
        <Button variant='outline' onClick={() => approve(user.id)}>
          Approve
        </Button>
      );
    } else if (user.active) {
      return (
        <Button variant='outline' onClick={() => revoke(user.id)}>
          <span className='text-bc-red-error'>Revoke</span>
        </Button>
      );
    } else {
      return 'Invited';
    }
  };

  return (
    <div className='overflow-x-auto'>
      <table className='w-full table-fixed'>
        <thead className='whitespace-nowrap bg-bc-light-gray text-bcDeepBlack'>
          <tr className='border-b-2 border-yellow-300 text-sm'>
            <th className='w-24' scope='col'>
              ID
            </th>
            <th className='w-24' scope='col'>
              Name
            </th>
            <th className='w-24' scope='col'>
              Email
            </th>
            <th className='w-24' scope='col'>
              Role
            </th>
            <th className='w-24' scope='col'>
              Created/<span className='text-bc-red-error'>Revoked</span>
            </th>
            <th className='py-4 w-24' scope='col'>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className='text-center'>
              <td className='py-4'>{user.id.substring(0, 8)}</td>
              <td>{_.startCase(user.name)}</td>
              <td>{user.email}</td>
              <td>{_.capitalize(user.role)}</td>
              <td className={user.revokedDate ? 'text-bc-red-error' : ''}>
                {dayjs(user.revokedDate ?? user.createdDate).format('YYYY-MM-DD')}
              </td>
              <td>{getButton(user)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
