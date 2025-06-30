import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  MessageFrame,
  MessageFramesApiProperty,
} from 'src/message/message.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Concept {
  @ApiProperty()
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty(MessageFramesApiProperty)
  @IsArray()
  @ArrayNotEmpty()
  @Column({ type: 'json' })
  frames: MessageFrame[];
}
