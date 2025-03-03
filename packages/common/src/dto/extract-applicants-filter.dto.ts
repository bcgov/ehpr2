import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { EmploymentTypes } from '../interfaces';

export class ExtractApplicantsFilterDTO {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  anywhereOnly?: boolean;

  @IsOptional()
  @IsArray()
  stream?: string[];

  @IsOptional()
  @IsArray()
  specialties?: string[];

  @IsOptional()
  @IsArray()
  subspecialties?: string[];

  @IsArray()
  @IsOptional()
  authorities?: string[];

  @IsArray()
  @IsOptional()
  locations?: string[];

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  registeredOnly?: boolean;

  @IsArray()
  @IsOptional()
  @IsEnum(EmploymentTypes, { each: true })
  currentEmployment?: EmploymentTypes[];
}
