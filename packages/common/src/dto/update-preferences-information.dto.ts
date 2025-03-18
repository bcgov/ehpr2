import { IsBoolean, IsNotEmpty, ValidateIf } from 'class-validator';
import { isRelatedToIndigenous } from '../helper';

export class UpdatePreferencesInformationDTO {
  constructor(base?: UpdatePreferencesInformationDTO) {
    this.completedSanyasIndigenousCulturalSafetyTraining =
      base?.completedSanyasIndigenousCulturalSafetyTraining;
    this.hasExperienceWithIndigenousCommunity = base?.hasExperienceWithIndigenousCommunity;
    this.hasExperienceWithRemoteRuralCommunity = base?.hasExperienceWithRemoteRuralCommunity;
  }
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
