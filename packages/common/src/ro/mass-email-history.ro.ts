import { GenericError } from 'src/interfaces';

export interface Recipient {
  id: string;
  email: string;
}

export interface MassEmailRecord {
  id: string;
  recipients: Recipient[];
  subject: string;
  errors?: GenericError[];
  messageIds?: Record<string, string>;
  createdDate: Date;
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
    active: boolean;
    ha: {
      id: number;
      name: string;
    };
  };
}

export interface MassEmailHistory {
  data: MassEmailRecord[];
  total: number;
}
