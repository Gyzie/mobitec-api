import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  MaxLength,
} from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export type PixelState = 1 | 0;

export class MessageFrame {
  delayMs: number;
  pixels: PixelState[][];
}

export const MessageFramesApiProperty: ApiPropertyOptions = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      delayMs: {
        type: 'number',
        example: 100,
      },
      pixels: {
        type: 'array',
        items: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        example: [
          [0, 0, 0, 1, 0, 0],
          [0, 1, 0, 0, 1, 0],
          [0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 1, 0],
          [0, 0, 0, 1, 0, 0],
        ],
      },
    },
  },
};

@Entity()
export class Message {
  @ApiProperty()
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'now' })
  @IsString()
  @MaxLength(255)
  @Column({ type: 'varchar', length: 255 })
  executeAt: string | Date;

  @ApiProperty(MessageFramesApiProperty)
  @IsArray()
  @ArrayNotEmpty()
  @Column({ type: 'json' })
  frames: MessageFrame[];
}
