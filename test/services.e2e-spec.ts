import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'typeorm';

import { AppModule } from '../src/app.module';
import { ServicesRepository } from './../src/modules/services/services.repository';
import { ServicesService } from './../src/modules/services/services.service';
import { factory, useSeeding } from 'typeorm-seeding';
import { DatabaseUtils } from './utils/database.utils';

describe('ServicesController (e2e)', () => {
  let app: INestApplication;
  let servicesRepository: ServicesRepository;
  let servicesService: ServicesService;
  let databaseUtils: DatabaseUtils;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    servicesRepository = app.get<ServicesRepository>(ServicesRepository);
    servicesService = app.get<ServicesService>(ServicesService);

    databaseUtils = new DatabaseUtils(moduleFixture.get<Connection>(Connection));
    // await useSeeding();
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await databaseUtils.clean();
  });

  describe('/services (GET)', () => {
    beforeEach(async () => {
      const serviceData = {name: 'prague', owner: 'eu', description: 'cities'};
      await servicesRepository.createEntity(serviceData);
      await servicesRepository.createEntity({...serviceData, name: 'tallinn'});
      await servicesRepository.createEntity({...serviceData, name: 'riga'});
      await servicesRepository.createEntity({...serviceData, name: 'vilnius'});
      await servicesRepository.createEntity({...serviceData, name: 'helsinki'});
      await servicesRepository.createEntity({...serviceData, name: 'bangkok', owner: 'asia'});
    });

    it('get list of available services in chronological order (default order recent first)', async () => {
      const serviceData = {name: 'calcutta', owner: 'asia', description: 'cities'};
      await servicesRepository.createEntity(serviceData);

      const response = await request(app.getHttpServer())
        .get('/services')
        .expect(200);
  
      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.meta).toBeDefined();
      expect(response.body.data.links).toBeDefined();

      expect(response.body.data.items[0]).toEqual(
        expect.objectContaining(serviceData)
      );
      expect(response.body.data.items.length).toEqual(7);
    });

    it('get list of available services paginated and sorted [limit=2, page=2, orderBy=createdAt orderType=DESC]', async () => {
      const limit = 2;
      const page = 2;

      const response = await request(app.getHttpServer())
        .get(`/services?limit=${limit}&page=${page}&orderBy=createdAt&orderType=DESC`)
        .expect(200);
      
      expect(response.body.data.items.length).toEqual(limit);

      expect(response.body.data.meta.totalItems).toEqual(6);
      expect(response.body.data.meta.itemsPerPage).toEqual(limit);
      expect(response.body.data.meta.totalPages).toEqual(3);
      expect(response.body.data.meta.currentPage).toEqual(page);

      expect(response.body.data.items[0].id).toEqual(3);
      expect(response.body.data.items[0].name).toEqual('riga');
    });

    it('get list of available services sorted by name in ascending order [orderBy=name orderType=ASC]', async () => {
      const response = await request(app.getHttpServer())
        .get(`/services?&orderBy=name&orderType=ASC`)
        .expect(200);

      expect(response.body.data.items[0].name).toEqual('bangkok');
      expect(response.body.data.items[5].name).toEqual('vilnius');
    });

    it('filter services list by field:owner [searchKey=owner, searchValue={string}]', async () => {
      const response = await request(app.getHttpServer())
        .get('/services?searchKey=owner&searchValue=asia')
        .expect(200);

      expect(response.body.data.meta.totalItems).toEqual(1);

      expect(response.body.data.items[0].id).toEqual(6);
      expect(response.body.data.items[0].name).toEqual('bangkok');
    });

    it('filter services list by field:createdAt [searchKey=createdAt, searchValue={date}]', async () => {
      const serviceData = {name: 'calcutta', owner: 'asia', description: 'cities'};
      const service = await servicesRepository.createEntity(serviceData);
      const date = '2020-01-01';
      await servicesRepository.update(service.id, {createdAt: date});

      const response = await request(app.getHttpServer())
        .get(`/services?searchKey=createdAt&searchValue=${date}`)
        .expect(200);

      expect(response.body.data.meta.totalItems).toEqual(1);

      expect(response.body.data.items[0].id).toEqual(service.id);
      expect(response.body.data.items[0].name).toEqual('calcutta');
    });

    it('filter services list by field:name [searchKey=name, searchValue={string}]', async () => {
      const response = await request(app.getHttpServer())
        .get('/services?searchKey=name&searchValue=tallinn')
        .expect(200);

      expect(response.body.data.meta.totalItems).toEqual(1);

      expect(response.body.data.items[0].id).toEqual(2);
      expect(response.body.data.items[0].name).toEqual('tallinn');
    });

    it('throws error on wrong filed as searchKey while filter services list [searchKey=blah, searchValue={string}]', async () => {
      const response = await request(app.getHttpServer())
        .get('/services?searchKey=blah&searchValue=tallinn')
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });

  describe('/services (POST)', () => {
    it('validate fields while creating service', async () => {
      const serviceData = {name: 'q', description: '', status: 'blah'};

      const response = await request(app.getHttpServer())
        .post('/services')
        .send(serviceData)
        .expect(400);
      
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();

      expect(response.body.message.length).toEqual(4); 
      // check for individual error messages can be there as well
    });

    it('create new service', async () => {
      const serviceData = {name: 'newsrv', owner: 'owner 123', description: 'desc', status: 'active'};
      const response = await request(app.getHttpServer())
        .post('/services')
        .send(serviceData)
        .expect(201);
      
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data).toEqual(
        expect.objectContaining(serviceData)
      );
      expect(response.body.data.createdAt).toEqual(expect.any(String));
    });

    it('throws error for duplicate service name while new service creation', async () => {
      const serviceData = {name: 'timbuktu', owner: 'king solomon', description: 'kingdom'};
      await servicesRepository.createEntity(serviceData);

      const response = await request(app.getHttpServer())
        .post('/services')
        .send(serviceData)
        .expect(400);
      
      expect(response.body.error).toBeDefined();
    });
  });

  describe('/services/:id (GET)', () => {
    it('get the service by :id', async () => {
      const serviceData = {name: 'newsrv', owner: 'owner 123', description: 'desc', status: 'active'};
      const service = await servicesRepository.createEntity(serviceData);

      const response = await request(app.getHttpServer())
        .get(`/services/${service.id}`)
        .expect(200);
      
      expect(response.body.data.id).toEqual(service.id);
      expect(response.body.data).toEqual(
        expect.objectContaining(serviceData)
      );
    });
  });

  describe('/services/:id (PATCH)', () => {
    it('validate fields while updating service', async () => {
      const serviceData = {name: 'srvname', owner: 'owner 1', description: 'desc'};
      const service = await servicesRepository.createEntity(serviceData);

      const updateData = {name: 'q', owner: 'o', description: '', status: 'blah'};
      const response = await request(app.getHttpServer())
      .patch(`/services/${service.id}`)
      .send(updateData)
      .expect(400);
      
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
      expect(response.body.message.length).toEqual(4);
    });

    it('update existing service', async () => {
      const serviceData = {name: 'srvname', owner: 'owner 1', description: 'desc'};
      const service = await servicesRepository.createEntity(serviceData);
      const updateData = {owner: 'king solomon', description: 'new desc'};
      
      const response = await request(app.getHttpServer())
        .patch(`/services/${service.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.updatedAt).toBeDefined();

      const serviceUpdated = await servicesRepository.getById(service.id);

      expect(serviceUpdated).toEqual(
        expect.objectContaining(updateData)
      );
      expect(serviceUpdated.updatedAt).toEqual(expect.any(Date));

    });

    it('throws error for duplicate service name while updating service', async () => {
      const serviceData = {name: 'timbuktu', owner: 'king solomon', description: 'kingdom'};
      await servicesRepository.createEntity(serviceData);
      
      serviceData.name = 'tallinn';
      const service = await servicesRepository.createEntity(serviceData);
      
      const response = await request(app.getHttpServer())
        .patch(`/services/${service.id}`)
        .send({name: 'timbuktu'})
        .expect(400);
      
      expect(response.body.error).toBeDefined();
    });
  });
  
});
