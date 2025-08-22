import { DataSource, DataSourceOptions } from 'typeorm';
import { Message } from './message/message.entity';
import { CreateMessage1750931262909 } from './migrations/1750931262909-create-message';
import { Concept } from './concept/concept.entity';
import { CreateConcept1751294686080 } from './migrations/1751294686080-create-concept';

export const typeOrmConfig: DataSourceOptions = {
  type: 'sqlite',
  database: 'data/database.sqlite',
  logging: true,
  entities: [Message, Concept],
  migrations: [CreateMessage1750931262909, CreateConcept1751294686080],
  migrationsRun: true,
};

export default new DataSource(typeOrmConfig);
