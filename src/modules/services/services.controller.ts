import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  Query,
  Req,
  ParseIntPipe,
  BadRequestException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Request } from 'express';

import { ServicesFilterFields, OrderType } from './interfaces/services.interface';
import { ServicesService } from './services.service';
import { CreateServiceDTO } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { requestedUrl } from '../../helpers/tools';
import * as Joi from 'joi';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  async getAllServices(
    @Query() query: any,
    @Req() request: any
  ) {
    const { orderBy, orderType, searchKey, searchValue, page = '1', limit = '10' } = query;
    const validationSchema = Joi.object({
      orderBy: Joi.string().valid(
        ServicesFilterFields.NAME, ServicesFilterFields.OWNER, ServicesFilterFields.CREATEDAT
      ).insensitive(),
      orderType: Joi.string().valid(OrderType.ASC, OrderType.DESC).insensitive(),
      searchKey: Joi.string().valid(
        ServicesFilterFields.ID, ServicesFilterFields.NAME, 
        ServicesFilterFields.OWNER, ServicesFilterFields.CREATEDAT
      ).insensitive(),
      searchValue: Joi.any().when('searchKey', {
				is: ServicesFilterFields.CREATEDAT,
				then: Joi.date().iso()
			}),
      page: Joi.number(),
      limit: Joi.number(),
    });

    const { error } = validationSchema.validate({
      orderBy, orderType, searchKey, searchValue, page, limit
    });
    if(error) throw new BadRequestException(error.message);

    return {
      statusCode: HttpStatus.OK,
      data: await this.servicesService.getAll(
        { orderBy, orderType, searchKey, searchValue },
        { page: parseInt(page), limit: parseInt(limit), route: requestedUrl(request, ['page', 'limit']) }
      )
    };
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createService(@Body() data: CreateServiceDTO) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service added successfully',
      data: await this.servicesService.create(data),
    };
  }

  @Get(':id')
  async getService(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.servicesService.get(id),
    };
  }

  // can be PUT as well
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async uppdateService(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateServiceDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service updated successfully',
      data: await this.servicesService.update(id, data),
    };
  }

  @Delete(':id')
  async deleteService(@Param('id', ParseIntPipe) id: number) {
    await this.servicesService.destroy(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Service deleted successfully',
    };
  }
}