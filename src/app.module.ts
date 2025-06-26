import { Module } from '@nestjs/common';
import { MessageController } from './message/message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message/message.service';
import { MessageGateway } from './message/message.gateway';
import { typeOrmConfig } from './datasource';
import { Message } from './message/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
})
export class AppModule {}
