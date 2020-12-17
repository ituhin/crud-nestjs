import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
import { ServicesFilter } from './interfaces/services.interface';
import { CreateServiceDTO } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesRepository } from './services.repository';

import {
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';


@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServicesRepository)
    private servicesRepository: ServicesRepository 
  ) {}

  async create(data: CreateServiceDTO) {
    const service = await this.servicesRepository.getByName(data.name);
    
    if(service) {
      throw new BadRequestException(`Service already exists with the name: ${data.name}`);
    }

    return await this.servicesRepository.createEntity(data);
  }

  async getAll(filter: ServicesFilter, options: IPaginationOptions) {
    return await this.servicesRepository.getAllWithPagination(filter, options);
  }

  async get(id: number) {
    const service = await this.servicesRepository.getById(id);

    if(!service){
      throw new NotFoundException(`Service not found by id: ${id}`);
    }

    return await this.servicesRepository.getById(id);
  }

  async update(id: number, data: UpdateServiceDto) {
    const service = await this.servicesRepository.getById(id);
    
    if(!service) {
      throw new BadRequestException(`Service not found by id: ${id}`);
    }

    if(data.name){
      const serviceWithSameName = await this.servicesRepository.getByName(data.name);
    
      if(serviceWithSameName && serviceWithSameName.id != id) {
        throw new BadRequestException(`Service already exists with the name: ${data.name}`);
      }
    }

    return await this.servicesRepository.updateEntity(id, data);
  }

  async destroy(id: number) {
    const service = await this.servicesRepository.getById(id);
    
    if(!service) {
      throw new BadRequestException(`Service not found by id: ${id}`);
    }

    return await this.servicesRepository.destroy(id);
  }


}