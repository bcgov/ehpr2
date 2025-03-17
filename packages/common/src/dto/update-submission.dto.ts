import 'reflect-metadata';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { ContactInformationDTO } from './contact-information.dto';
import { PersonalInformationDTO } from './personal-information.dto';
import { StatusUpdateDTO } from './status-update.dto';
import { PreferencesInformationDTO } from './preferences-information.dto';
import { UpdatePreferencesInformationDTO } from './update-preferences-information.dto';

export class UpdateSubmissionDTO {
  constructor(base?: UpdateSubmissionDTO) {
    if (base) {
      this.contactInformation = new ContactInformationDTO(base.contactInformation);
      this.personalInformation = new PersonalInformationDTO(base.personalInformation);
      this.preferencesInformation = new UpdatePreferencesInformationDTO(
        base.preferencesInformation,
      );
      this.status = new StatusUpdateDTO(base.status);
    }
  }
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => ContactInformationDTO)
  contactInformation!: ContactInformationDTO;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => PersonalInformationDTO)
  personalInformation!: PersonalInformationDTO;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UpdatePreferencesInformationDTO)
  preferencesInformation!: UpdatePreferencesInformationDTO;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => StatusUpdateDTO)
  status!: StatusUpdateDTO;
}
