import { DataSource, DataSourceOptions } from 'typeorm';
import { Message } from './message/message.entity';
import { CreateMessage1750931262909 } from './migrations/1750931262909-create-message';

export const typeOrmConfig: DataSourceOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  logging: true,
  entities: [Message],
  migrations: [CreateMessage1750931262909],
  migrationsRun: true,
};

export default new DataSource(typeOrmConfig);
