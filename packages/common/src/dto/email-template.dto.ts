import 'reflect-metadata';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class RegistrantDataDTO {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class EmailTemplateDTO {
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsArray()
  @Type(() => RegistrantDataDTO)
  @ValidateNested({ each: true })
  data!: RegistrantDataDTO[];

  @Transform(o => o.value === true || o.value === 'true')
  @IsBoolean()
  @IsOptional()
  isTest?: boolean;
}
