import {IsOptional, Length, IsEnum, IsNotEmpty } from 'class-validator';

import { ServiceStatus } from '../interfaces/services.interface';

export class UpdateServiceDto {
  @IsOptional()
  @Length(3, 16)
  name?: string;

  @IsOptional()
  @Length(3, 32)
  owner?: string;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(ServiceStatus, { 
    message: `status must be ${ServiceStatus.ACTIVE} or ${ServiceStatus.INACTIVE}`
  })
  status?: string;
}