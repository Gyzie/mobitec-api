import { OmitType } from '@nestjs/swagger';
import { Concept } from './concept.entity';

export class CreateConceptDto extends OmitType(Concept, ['id'] as const) {}
