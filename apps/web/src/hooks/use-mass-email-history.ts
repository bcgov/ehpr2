import axios from 'axios';
import useSWR from 'swr';
import { MassEmailHistory, PaginationQuery } from '@ehpr/common';

export const useMassEmailHistory = ({ skip, limit }: PaginationQuery) => {
  const { data, ...response } = useSWR<{ data: MassEmailHistory }>(
    `/registrants/mass-email-history?skip=${skip}&limit=${limit}`,
    axios.get,
  );

  return { ...data, ...response };
};
