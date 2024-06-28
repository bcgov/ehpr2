import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { InviteUserDTO, User } from '@ehpr/common';
import { approveUser, getUsers, inviteUser, revokeUser } from '@services';

interface AdminContextProps {
  users: User[];
  approve: (id: string) => Promise<void>;
  revoke: (id: string) => Promise<void>;
  invite: (payload: InviteUserDTO) => Promise<void>;
}

const AdminContext = createContext<AdminContextProps>({
  users: [],
  approve: () => Promise.resolve(void 0),
  revoke: () => Promise.resolve(void 0),
  invite: () => Promise.resolve(void 0),
});

export const AdminProvider = ({ children }: PropsWithChildren<ReactNode>) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers).catch();
  }, []);

  const replaceUser = useCallback((user?: User) => {
    if (user) {
      setUsers(_.map(users, u => (u.id === user.id ? user : u)));
    }
  }, []);

  const approve = useCallback(async (id: string) => {
    replaceUser(await approveUser(id));
    getUsers().then(setUsers).catch();
  }, []);

  const revoke = useCallback(async (id: string) => {
    replaceUser(await revokeUser(id));
    getUsers().then(setUsers).catch();
  }, []);

  const invite = useCallback(
    async (payload: InviteUserDTO) => {
      if (users.some(u => u.email === payload.email)) {
        const message = `There is a user with the email address.`;
        toast.error(message);
        throw Error(message);
      } else {
        const user = await inviteUser(payload);
        setUsers(u => [...u, user]);
        toast.info(`Invited user ${user.email}`);
      }
    },
    [users],
  );

  const contextValue = useMemo(
    () => ({
      users,
      approve,
      revoke,
      invite,
    }),
    [users, approve, revoke, invite],
  );

  return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider');
  }
  return context;
};
