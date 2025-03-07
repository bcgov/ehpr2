import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationQuery } from 'src/interfaces';

export class PaginationDTO implements PaginationQuery {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  skip?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit?: number;
}
