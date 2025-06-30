import { Module } from '@nestjs/common';
import { MessageController } from './message/message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message/message.service';
import { MessageGateway } from './message/message.gateway';
import { typeOrmConfig } from './datasource';
import { Message } from './message/message.entity';
import { Concept } from './concept/concept.entity';
import { ConceptController } from './concept/concept.controller';
import { ConceptService } from './concept/concept.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Message, Concept]),
  ],
  controllers: [MessageController, ConceptController],
  providers: [MessageService, MessageGateway, ConceptService],
})
export class AppModule {}
