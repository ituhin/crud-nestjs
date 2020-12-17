/**
 * This repository represents the
 * interface between the application service-entity
 * and the database.
 */

import { EntityRepository, Repository, Connection } from 'typeorm';
// import { Injectable } from '@nestjs/common';
import { CreateServiceDTO } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesEntity } from './services.entity';
import { ServicesFilter } from './interfaces/services.interface';
import * as moment from 'moment';

import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

// @Injectable()
@EntityRepository(ServicesEntity)
export class ServicesRepository extends Repository<ServicesEntity> {
  async getById(id: number): Promise<ServicesEntity | undefined> {
    return this.findOne({ where: { id } });
  }

  async getByName(name: string): Promise<ServicesEntity | undefined> {
    return this.findOne({ where: { name } });
  }

  async getAll(): Promise<ServicesEntity[] | undefined> {
    return this.find();
  }

  async getAllWithPagination(filter: ServicesFilter, options: IPaginationOptions): Promise<Pagination<ServicesEntity>> {
    const { orderBy = 'id', orderType = 'DESC', searchKey, searchValue } = filter;
    const queryBuilder = this.createQueryBuilder();

    if(options.limit > 100) options.limit = 100; // standard safety
    
    if(searchKey && searchValue) {
      if(searchKey == 'createdAt'){
        const nextDay = moment(searchValue).add(1, 'days').format('YYYY-MM-DD');

        queryBuilder.where(`createdAt >= :searchValue AND createdAt < :nextDay`, {searchValue, nextDay});
      } else {
        queryBuilder.where(`${searchKey} LIKE :searchValue`, { searchValue: `${searchValue}%` });
      }
    }

    queryBuilder.orderBy(orderBy, orderType);

    return paginate<ServicesEntity>(queryBuilder, options);
  }

  async createEntity(data: CreateServiceDTO): Promise<ServicesEntity> {
    return this.create(data).save();
  }

  async updateEntity(id: number, data: UpdateServiceDto): Promise<ServicesEntity | undefined> {
    return this.save({
      id: id,
      ...data,
    });
  }

  async destroy(id: number) {
    return this.delete({ id })
  }
}