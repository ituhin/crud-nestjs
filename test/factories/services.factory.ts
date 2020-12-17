import { define } from 'typeorm-seeding';
import * as Faker from 'faker';
import { ServicesEntity } from '../../src/modules/services/services.entity';

define(ServicesEntity, (faker: typeof Faker) => {
  const service = new ServicesEntity();

  service.name = faker.random.word();
  service.owner = faker.name.firstName() + ' ' + faker.name.lastName();
  service.description = faker.lorem.sentence();

  return service;
});
