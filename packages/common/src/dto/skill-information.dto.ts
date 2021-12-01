import { CurrentEmploymentTypes, RegistrationStatus, StreamTypes } from '../interfaces';
import { IsIn, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class SkillInformationDTO {
  @IsString()
  @IsIn(Object.values(StreamTypes))
  streamTypes!: StreamTypes;

  @IsString()
  @IsIn(Object.values(RegistrationStatus))
  registrationStatus!: RegistrationStatus;

  @IsNumber()
  @Max(99999999)
  @Min(0)
  registrationNumber!: number;

  @IsString()
  @IsIn(Object.values(CurrentEmploymentTypes))
  currentEmploymentType!: CurrentEmploymentTypes;

  @IsString()
  @Length(1, 256)
  @IsOptional()
  additionalComments?: string;
}
