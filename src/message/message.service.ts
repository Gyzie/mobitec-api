import { Injectable, NotImplementedException } from '@nestjs/common';
import { Message, MessageFrame } from './message.entity';
import nodeCron from 'node-cron';

export type MessageListener = (messageFrames: MessageFrame[]) => void;

@Injectable()
export class MessageService {
  private listeners: MessageListener[] = [];

  public subscribe(callback: MessageListener) {
    this.listeners.push(callback);
  }

  public processMessage(message: Omit<Message, 'id'>): void {
    if (message.executeAt === 'now') {
      this.sendMessage(message.frames);
    } else if (message.executeAt instanceof Date) {
      this.planMessage(message.frames, message.executeAt);
    } else if (nodeCron.validate(message.executeAt)) {
      this.scheduleMessage(message.frames, message.executeAt);
    } else {
      throw new Error('Invalid executeAt in message object');
    }
  }

  private emitToListeners(messageFrames: MessageFrame[]): void {
    this.listeners.forEach((callback) => callback(messageFrames));
  }

  private sendMessage(messageFrames: MessageFrame[]): void {
    console.log('sending message', { messageFrames });
    this.emitToListeners(messageFrames);
  }

  private planMessage(messageFrames: MessageFrame[], executeAt: Date): void {
    console.log('plan message', { messageFrames, executeAt });
    throw new NotImplementedException('Planning messages not yet supported');
  }

  private scheduleMessage(messageFrames: MessageFrame[], cron: string): void {
    console.log('schedule message', { messageFrames, cron });
    throw new NotImplementedException('Scheduling messages not yet supported');
  }
}
