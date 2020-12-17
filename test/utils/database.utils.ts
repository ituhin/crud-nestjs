import { Connection } from 'typeorm';

export class DatabaseUtils {
  constructor(private connection: Connection) {}

  async clean() {
    const promises = [];

    this.connection.entityMetadatas.forEach((entity) => {
      const repository = this.connection.getRepository(entity.name);

      promises.push(repository.query(`TRUNCATE TABLE ${entity.tablePath}`));
    });

    return Promise.all(promises);
  }
}
