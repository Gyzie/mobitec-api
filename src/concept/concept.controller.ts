import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { CreateConceptDto } from './create-concept.dto';
import { ConceptService } from './concept.service';
import { Concept } from './concept.entity';
import { MessageService } from 'src/message/message.service';
import { ApiSecurity } from '@nestjs/swagger';
import { AUTH_KEY_HEADER } from 'src/guards/auth.guard';

@Controller('concept')
@ApiSecurity('api_key', [AUTH_KEY_HEADER])
export class ConceptController {
  constructor(
    private conceptService: ConceptService,
    private messageService: MessageService,
  ) {}

  @Get()
  list(): Promise<Concept[]> {
    return this.conceptService.list();
  }

  @Delete('/:id')
  delete(@Param('id') id: number): Promise<void> {
    return this.conceptService.delete(id);
  }

  @Post()
  async create(
    @Body() createConceptDto: CreateConceptDto,
  ): Promise<CreateConceptDto> {
    createConceptDto.frames = this.messageService.parseDtoFrames(
      createConceptDto.frames,
    );

    await this.conceptService.create(createConceptDto);
    return createConceptDto;
  }
}
