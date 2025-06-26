import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { CreateMessageDto } from './create-message.dto';
import { MessageService } from './message.service';
import nodeCron from 'node-cron';
import { Message } from './message.entity';

@Controller('message')
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
    // Validate createAt
    if (this.messageService.isDate(createMessageDto.executeAt)) {
      const createAtAsDate = new Date(createMessageDto.executeAt);
      if (createAtAsDate.getTime() < new Date().getTime()) {
        throw new BadRequestException('executeAt cannot be in the past');
      }
      createMessageDto.executeAt = createAtAsDate;
    } else if (
      typeof createMessageDto.executeAt !== 'string' ||
      (createMessageDto.executeAt !== 'now' &&
        !nodeCron.validate(createMessageDto.executeAt))
    ) {
      throw new BadRequestException(
        "executeAt must be a date, 'now' or a cron string",
      );
    }

    // Validate frames object
    createMessageDto.frames = createMessageDto.frames.map((frame, index) => {
      if (
        typeof frame.delayMs !== 'number' ||
        frame.delayMs < 0 ||
        !Number.isInteger(frame.delayMs)
      ) {
        throw new BadRequestException(
          `Frame at index ${index} as an invalid delayMs: Must be a positive integer.`,
        );
      }

      if (
        !Array.isArray(frame.pixels) ||
        frame.pixels.some(
          (row) =>
            !Array.isArray(row) || row.some((pixel) => ![0, 1].includes(pixel)),
        )
      ) {
        throw new BadRequestException(
          `Frame at index ${index} as an invalid pixels: Must be (1,0)[][].`,
        );
      }

      return { delayMs: frame.delayMs, pixels: frame.pixels };
    });

    await this.messageService.processMessage(createMessageDto);
    return createMessageDto;
  }
}
