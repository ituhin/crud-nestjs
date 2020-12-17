export function getDbConfig() {
  // ideally auth related config should stay in env or come from a config service

  const db = {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "mydev123",
    "database": "tavid",
    "synchronize": false,
    "logging": true,
    "entities": ["dist/**/*.entity{.ts,.js}"],
    "migrations": ["dist/migrations/*.{.ts,.js}", "src/migrations/*.{.ts,.js}"],
  }

  const dbTest = {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "mydev123",
    "database": "tavid_test",
    "synchronize": true,
    "logging": false,
    "entities": ["dist/**/*.entity{.ts,.js}", "src/**/*.entity{.ts,.js}"],
    "migrations": ["dist/migrations/*.{.ts,.js}", "src/migrations/*.{.ts,.js}"],
    "seeds": ['test/seeds/*.seed.ts'],
    "factories": ['test/factories/*.factory.ts'],
  }

  return process.env.NODE_ENV == 'test' ? dbTest : db;
}