import axios from 'axios';
import { User } from '@ehpr/common';

export const getUser = async (id: string) => {
  try {
    const response = await axios.get<{ data: User }>(`/users/${id}`);
    return response?.data?.data as User;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getLoggedUser = () => getUser('me');

export const getUsers = async () => {
  try {
    const response = await axios.get<{ data: User[] }>('/users');
    return response?.data?.data as User[];
  } catch (e) {
    console.error(e);
    return [];
  }
};
