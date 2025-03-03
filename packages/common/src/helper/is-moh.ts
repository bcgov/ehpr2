import { Authorities } from '../constants';
import { getAuthorityByEmail } from './get-authority-by-email';

export const isMoh = (email?: string) => getAuthorityByEmail(email) === Authorities.MOH;
