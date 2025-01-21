import axios from 'axios';
import { InviteUserDTO, User } from '@ehpr/common';

export const inviteUser = async (payload: InviteUserDTO) => {
  const { data } = await axios.post<{ data: User }>('/admin/invite', payload);
  return data?.data as User;
};

export const approveUser = async (id: string) => {
  const { data } = await axios.patch<{ data: User }>(`/admin/${id}/approve`);
  return data?.data as User;
};

export const revokeUser = async (id: string) => {
  const { data } = await axios.patch<{ data: User }>(`/admin/${id}/revoke`);
  return data?.data as User;
};

export const extractSubmissions = async (anywhereOnly?: boolean) => {
  const response = await axios.get<{ data: string }>(
    `/admin/extract-submissions?anywhereOnly=${anywhereOnly}`,
  );
  return response?.data?.data;
};
