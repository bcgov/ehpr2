import { AxiosError } from 'axios';

export const getErrorMessage = (e: AxiosError | string): string => {
  if (typeof e === 'string') {
    return e;
  }
  const data = e.response?.data as { errorMessage?: string; errorType?: string };
  return data?.errorMessage ? `${data.errorType}: ${data.errorMessage}` : e.message;
};
