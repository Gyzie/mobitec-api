import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateMessageDto } from './create-message.dto';
import { MessageService } from './message.service';
import { Message } from './message.entity';
import { AUTH_KEY_HEADER } from 'src/guards/auth.guard';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('message')
@ApiSecurity('api_key', [AUTH_KEY_HEADER])
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get()
  listMessages(): Promise<Message[]> {
    return this.messageService.listQueuedMessages();
  }

  @Delete('/:id')
  deleteMessage(@Param('id') id: number): Promise<void> {
    return this.messageService.deleteQueuedMessage(id);
  }

  @Post()
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<CreateMessageDto> {
    createMessageDto.executeAt = this.messageService.parseDtoExecuteAt(
      createMessageDto.executeAt,
    );

    createMessageDto.frames = this.messageService.parseDtoFrames(
      createMessageDto.frames,
    );

    await this.messageService.processMessage(createMessageDto);
    return createMessageDto;
  }
}
