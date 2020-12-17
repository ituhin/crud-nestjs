import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateServicesTable1608080448571 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS services (
            id int(10) unsigned NOT NULL AUTO_INCREMENT,
            name varchar(16) NOT NULL,
            owner varchar(32) NOT NULL,
            description text NOT NULL,
            status enum('active','inactive') NOT NULL DEFAULT 'inactive',
            createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY idx_name (name),
            KEY idx_owner (owner),
            KEY idx_createdAt (createdAt)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('services');
    }

}
