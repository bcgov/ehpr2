import {
  PreferencesInformationDTO,
  PlacementOptions,
  DeploymentDurations,
  DeploymentTypes,
  PreviousDeploymentOptions,
} from '@ehpr/common';
import { OptionType } from '@components';
import { getHas, getHsdasByHaId, getLhasByHsdaId, HaId } from '@ehpr/common';

export { PersonalInformationDTO } from '@ehpr/common';

export const preferencesDefaultValues: Partial<PreferencesInformationDTO> = {
  deployAnywhere: undefined,
  deploymentLocations: [],
  placementOptions: [],
  hasImmunizationTraining: undefined,
  deploymentDuration: undefined,
  deploymentType: [],
  hasPreviousDeployment: undefined,
  lastDeployedHa: undefined,
  lastDeploymentDate: undefined,
  hasExperienceWithIndigenousCommunity: undefined,
  hasExperienceWithRemoteRuralCommunity: undefined,
  completedSanyasIndigenousCulturalSafetyTraining: undefined,
};

export const haOptions = getHas().map(({ id, name }) => ({
  value: id,
  label: name,
}));

export const getHsdaOptions = (haSelection: HaId): OptionType[] => {
  const hsdas = getHsdasByHaId(haSelection);

  return hsdas.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
};

export const getLhaOptions = (hsdaSelection: string): OptionType[] => {
  const lhas = getLhasByHsdaId(hsdaSelection);

  return lhas.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
};

export const HaPdfSizeMap: Record<HaId, { size: number; url: string }> = {
  VancouverCoastal: {
    size: 1.4,
    url: 'https://www2.gov.bc.ca/assets/gov/data/geographic/land-use/administrative-boundaries/health-boundaries/3_vancouver_coastal_health_authority.pdf',
  },
  FraserRegion: {
    size: 2,
    url: 'https://www2.gov.bc.ca/assets/gov/data/geographic/land-use/administrative-boundaries/health-boundaries/2_fraser_health_authority.pdf',
  },
  VancouverIslandRegion: {
    size: 2.3,
    url: 'https://www2.gov.bc.ca/assets/gov/data/geographic/land-use/administrative-boundaries/health-boundaries/4_vancouver_island_health_authority.pdf',
  },
  InteriorRegion: {
    size: 1.8,
    url: 'https://www2.gov.bc.ca/assets/gov/data/geographic/land-use/administrative-boundaries/health-boundaries/1_interior_health_authority.pdf',
  },
  NorthernRegion: {
    size: 1.3,
    url: 'https://www2.gov.bc.ca/assets/gov/data/geographic/land-use/administrative-boundaries/health-boundaries/5_northern_health_authority.pdf',
  },
  FirstNationsHealthAuthority: {
    size: 0,
    url: '',
  },
};

export const placementOptions = [
  { label: 'Critical care/intensive care units', value: PlacementOptions.CRITICAL_CARE_ICU },
  { label: 'Emergency Departments', value: PlacementOptions.EMERGENCY_DEPARTMENTS },
  { label: 'Long term care', value: PlacementOptions.LONG_TERM_CARE },
  { label: 'Home support', value: PlacementOptions.HOME_SUPPORT },
  {
    label: 'COVID-19 specific support (such as immunization and testing)',
    value: PlacementOptions.COVID_19_SUPPORT,
  },
  { label: 'Anywhere needed', value: PlacementOptions.ANYWHERE },
  { label: 'Other', value: PlacementOptions.OTHER },
];
// 1,2,4,8,8+
export const deploymentDurationOptions = [
  { label: '1 week', value: DeploymentDurations.ONE_WEEK },
  { label: '2 weeks', value: DeploymentDurations.TWO_WEEKS },
  { label: '4 weeks', value: DeploymentDurations.FOUR_WEEKS },
  { label: '8 weeks', value: DeploymentDurations.EIGHT_WEEKS },
  { label: '8+ weeks', value: DeploymentDurations.EIGHT_PLUS },
];

export const deploymentTypeOptions = [
  { label: 'Full-Time', value: DeploymentTypes.FULL_TIME },
  { label: 'Part-Time', value: DeploymentTypes.PART_TIME },
];

export const previousDeploymentOptions = [
  {
    label: 'Yes',
    value: PreviousDeploymentOptions.YES,
  },
  {
    label: 'No/Unsure',
    value: PreviousDeploymentOptions.NO_OR_UNSURE,
  },
];
