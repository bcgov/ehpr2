import { Authorities, Authority } from '../constants';

export const getAuthorityByEmail = (email?: string): Authority | undefined => {
  if (email) {
    const domain = email.split('@')[1];
    return Object.values(Authorities).find(authority => authority.domains.includes(domain));
  }
};
