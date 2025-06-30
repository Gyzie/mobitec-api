import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Concept } from './concept.entity';

@Injectable()
export class ConceptService {
  constructor(
    @InjectRepository(Concept) private conceptRepository: Repository<Concept>,
  ) {}

  public list(): Promise<Concept[]> {
    return this.conceptRepository.find();
  }

  public async delete(id: number): Promise<void> {
    await this.conceptRepository.delete({ id });
  }

  public async create(newConcept: Omit<Concept, 'id'>): Promise<Concept> {
    const concept = new Concept();
    concept.name = newConcept.name;
    concept.frames = newConcept.frames;
    return this.conceptRepository.save(concept);
  }
}
