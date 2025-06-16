/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Length,
  IsOptional,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @ApiPropertyOptional()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'price should not be less than zero' })
  @IsOptional()
  @ApiPropertyOptional()
  price?: number;
}
