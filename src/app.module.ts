import { Module } from '@nestjs/common';
import { MessageController } from './message/message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message/message.entity';
import { MessageService } from './message/message.service';
import { MessageGateway } from './message/message.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      logging: true,
      entities: [Message],
      migrations: [],
    }),
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
})
export class AppModule {}
