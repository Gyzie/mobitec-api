import { OmitType } from '@nestjs/swagger';
import { Message } from './message.entity';

export class CreateMessageDto extends OmitType(Message, ['id'] as const) {}
