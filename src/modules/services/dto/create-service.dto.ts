import {IsNotEmpty, Length, IsEnum, IsOptional } from 'class-validator';

import { ServiceStatus } from '../interfaces/services.interface';

export class CreateServiceDTO {
  @Length(3, 16)
  name: string;

  @Length(3, 32)
  owner: string;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(ServiceStatus, { 
    message: `status must be ${ServiceStatus.ACTIVE} or ${ServiceStatus.INACTIVE}`
  })
  status?: string;
}