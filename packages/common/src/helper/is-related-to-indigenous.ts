import { PreferencesInformationDTO } from 'src/dto';
import { getLhasbyHaId } from './locationData';

export const isRelatedToIndigenous = (
  preferencesInformation: PreferencesInformationDTO,
): boolean => {
  return (
    preferencesInformation.deployAnywhere ||
    getLhasbyHaId('FirstNationsHealthAuthority').some(loc =>
      preferencesInformation.deploymentLocations?.some(dl => dl === loc.id),
    )
  );
};
