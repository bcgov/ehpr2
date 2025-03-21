import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  Validate,
  ValidateIf,
} from 'class-validator';

import {
  DeploymentDurations,
  PlacementOptions,
  DeploymentTypes,
  PreviousDeploymentOptions,
} from '../interfaces';

import { isRelatedToIndigenous, LhaId, validLhaIds } from '../helper';
import { IsArrayOfLhas, ValidateArray } from '../validators';

export class PreferencesInformationDTO {
  constructor(base?: PreferencesInformationDTO) {
    if (base) {
      this.deployAnywhere = base.deployAnywhere;
      this.deploymentLocations = base.deploymentLocations;
      this.placementOptions = base.placementOptions;
      this.hasImmunizationTraining = base.hasImmunizationTraining;
      this.deploymentDuration = base.deploymentDuration;
      this.deploymentType = base.deploymentType;
      this.hasPreviousDeployment = base.hasPreviousDeployment;
      this.lastDeployedHa = base.lastDeployedHa;
      this.lastDeploymentDate = base.lastDeploymentDate;
      this.hasExperienceWithIndigenousCommunity = base.hasExperienceWithIndigenousCommunity;
      this.hasExperienceWithRemoteRuralCommunity = base.hasExperienceWithRemoteRuralCommunity;
      this.completedSanyasIndigenousCulturalSafetyTraining =
        base.completedSanyasIndigenousCulturalSafetyTraining;
    }
  }

  @IsBoolean({ message: 'This field is required' })
  deployAnywhere!: boolean;

  @ValidateIf(o => o.deployAnywhere === false)
  @IsArray({ message: 'Location selection is required' })
  @ArrayMinSize(1, { message: 'Location selection is required' })
  @ArrayMaxSize(validLhaIds.length, {
    message: 'Invalid location selection',
  })
  @Validate(IsArrayOfLhas)
  @ValidateArray({ context: { accepts: validLhaIds, name: 'HealthAuthorities' } })
  deploymentLocations!: LhaId[];

  @IsArray({ message: 'Placement options are required' })
  @ArrayMinSize(1, { message: 'Placement options are required' })
  @ArrayMaxSize(Object.values(PlacementOptions).length, {
    message: 'Invalid placement options',
  })
  @ValidateArray({ context: { accepts: PlacementOptions, name: 'PlacementOptions' } })
  placementOptions!: PlacementOptions[];

  @IsBoolean({ message: 'This field is required' })
  hasImmunizationTraining!: boolean;

  @IsIn(Object.values(DeploymentDurations), { message: 'Invalid deployment duration selection' })
  @IsString({ message: 'Deployment duration is required' })
  deploymentDuration!: DeploymentDurations;

  @IsArray({ message: 'Deployment type is required' })
  @ArrayMinSize(1, { message: 'Deployment type is required' })
  @ArrayMaxSize(Object.values(DeploymentTypes).length, {
    message: 'Invalid deployment type selection',
  })
  @ValidateArray({ context: { accepts: DeploymentTypes, name: 'DeploymentTypes' } })
  deploymentType!: DeploymentTypes[];
  @IsIn(Object.values(PreviousDeploymentOptions), {
    message: 'Previous deployment question is invalid',
  })
  @IsString({ message: 'Previous deployment question is required' })
  hasPreviousDeployment!: PreviousDeploymentOptions;

  @ValidateIf(p => p.hasPreviousDeployment === PreviousDeploymentOptions.YES)
  @IsString({ message: 'Last deployed Health Authority is required' })
  @IsNotEmpty({ message: 'Last deployed Health Authority is required' })
  lastDeployedHa!: string;

  @ValidateIf(p => p.hasPreviousDeployment === PreviousDeploymentOptions.YES)
  @IsString({ message: 'Date of last deployment is required' })
  @IsNotEmpty({ message: 'Date of last deployment is required' })
  lastDeploymentDate!: string;

  @ValidateIf(isRelatedToIndigenous)
  @IsBoolean()
  @IsNotEmpty({ message: 'This field is required' })
  hasExperienceWithIndigenousCommunity?: boolean;

  @ValidateIf(isRelatedToIndigenous)
  @IsBoolean()
  @IsNotEmpty({ message: 'This field is required' })
  hasExperienceWithRemoteRuralCommunity?: boolean;

  @ValidateIf(isRelatedToIndigenous)
  @IsBoolean()
  @IsNotEmpty({ message: 'This field is required' })
  completedSanyasIndigenousCulturalSafetyTraining?: boolean;
}
