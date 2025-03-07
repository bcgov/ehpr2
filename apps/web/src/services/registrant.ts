import axios from 'axios';
import {
  EmailTemplateDTO,
  RegistrantFilterDTO,
  RegistrantRO,
  UnsubscribeReasonDTO,
} from '@ehpr/common';
import { convertToParams } from '../util';
import { DeepPartial } from 'src/components/submission/validation';

export const getRegistrants = async (filter: RegistrantFilterDTO) => {
  const response = await axios.get<{ data: [RegistrantRO[], number] }>(
    `/registrants?${convertToParams(filter)}`,
  );

  if (Array.isArray(response?.data?.data)) {
    const [data, count] = response.data.data;
    return { data, count };
  }
  return { data: [], count: 0 };
};

export const sendMassEmail = async (payload: EmailTemplateDTO): Promise<void> => {
  await axios.post('/registrants/send-mass-email', payload);
};

export const downloadMassEmailHistory = async () => {
  const response = await axios.get<{ data: string }>(`/registrants/download-mass-email`);
  return response?.data?.data;
};

export const unsubscribe = async (
  token: string,
  payload: DeepPartial<UnsubscribeReasonDTO>,
): Promise<{ status: number; data: string }> => {
  const { status, data } = await axios.post(`/registrants/unsubscribe?token=${token}`, payload);
  return { status, data };
};
