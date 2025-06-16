/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Length, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50, {
    message: 'Title must be between 3 and 50 characters long',
  })
  @ApiProperty()
  title: string;

  @IsString()
  @MinLength(5)
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0, {
    message: 'Price must be a positive number',
  })
  @ApiProperty()
  price: number;
}
