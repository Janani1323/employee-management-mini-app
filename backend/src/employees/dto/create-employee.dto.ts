import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { EmployeeStatus } from '../enums/employee-status.enum';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  designation: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  salary: number;

  @IsDateString()
  joiningDate: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
