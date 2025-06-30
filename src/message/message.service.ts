import { BadRequestException, Injectable } from '@nestjs/common';
import { Message, MessageFrame } from './message.entity';
import nodeCron, { ScheduledTask } from 'node-cron';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export type MessageListener = (messageFrames: MessageFrame[]) => void;

@Injectable()
export class MessageService {
  private listeners: MessageListener[] = [];
  private scheduledTasks: ScheduledTask[] = [];
  private plannedTasks: { at: Date; id: number; frames: MessageFrame[] }[] = [];

  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
  ) {
    this.reloadQueuedMessagesFromDatabase().catch((err) =>
      console.error('Failed to load queued messages from database', err),
    );
    this.initSendPlannedTasksLoop();
  }

  /**
   * @throws RequestException if frames is invalid
   */
  public parseDtoExecuteAt(executeAt: Date | string): Date | string {
    // Validate createAt
    if (this.isDate(executeAt)) {
      const createAtAsDate = new Date(executeAt);
      if (createAtAsDate.getTime() < new Date().getTime()) {
        throw new BadRequestException('executeAt cannot be in the past');
      }
      return createAtAsDate;
    } else if (
      typeof executeAt !== 'string' ||
      (executeAt !== 'now' && !nodeCron.validate(executeAt))
    ) {
      throw new BadRequestException(
        "executeAt must be a date, 'now' or a cron string",
      );
    }
    return executeAt;
  }

  /**
   * @throws RequestException if frames is invalid
   */
  public parseDtoFrames(frames: MessageFrame[]): MessageFrame[] {
    // Validate frames object
    return frames.map((frame, index) => {
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
  }

  public subscribe(callback: MessageListener) {
    this.listeners.push(callback);
  }

  public async processMessage(message: Omit<Message, 'id'>): Promise<void> {
    if (message.executeAt === 'now') {
      this.sendMessage(message.frames);
    } else {
      const savedMessage = await this.saveMessage(message);
      this.queueMessage(savedMessage);
    }
  }

  public isDate(value: string | Date): boolean {
    const date = new Date(value);
    return date.toString() !== 'Invalid Date';
  }

  private async reloadQueuedMessagesFromDatabase(): Promise<void> {
    await this.clearTasks();
    const messages = await this.messageRepository.find();
    for (const message of messages) {
      if (this.isDate(message.executeAt)) {
        message.executeAt = new Date(message.executeAt);
      }

      try {
        this.queueMessage(message);
      } catch (err) {
        console.warn('Failed to queue message from database', message, err);
      }
    }
  }

  private queueMessage(message: Message): void {
    if (message.executeAt instanceof Date) {
      this.planMessage(message.id, message.frames, message.executeAt);
    } else if (nodeCron.validate(message.executeAt)) {
      this.scheduleMessage(message.frames, message.executeAt);
    } else {
      throw new BadRequestException(
        'Invalid executeAt in message object for queue',
      );
    }
  }

  public listQueuedMessages(): Promise<Message[]> {
    return this.messageRepository.find();
  }

  public async deleteQueuedMessage(
    id: number,
    { skipReload }: { skipReload?: boolean } = {},
  ): Promise<void> {
    await this.messageRepository.delete({ id });

    if (!skipReload) {
      await this.reloadQueuedMessagesFromDatabase();
    }
  }

  private initSendPlannedTasksLoop(): void {
    // Every second
    nodeCron.schedule('* * * * * *', () => {
      this.sendPlannedTasks();
    });
  }

  private sendPlannedTasks(): void {
    this.plannedTasks = this.plannedTasks.filter((task) => {
      const now = new Date();

      if (now.getTime() >= task.at.getTime()) {
        this.deleteQueuedMessage(task.id)
          .then(() => {
            this.sendMessage(task.frames);
          })
          .catch((err) =>
            console.error(
              'Failed to delete planned message after sending',
              err,
            ),
          );
        return false;
      }

      return true;
    });
  }

  private emitToListeners(messageFrames: MessageFrame[]): void {
    this.listeners.forEach((callback) => callback(messageFrames));
  }

  private sendMessage(messageFrames: MessageFrame[]): void {
    console.log('sending message', { messageFrames });
    this.emitToListeners(messageFrames);
  }

  private planMessage(
    id: number,
    messageFrames: MessageFrame[],
    executeAt: Date,
  ): void {
    console.log('plan message', { messageFrames, executeAt });

    this.plannedTasks.push({ at: executeAt, id, frames: messageFrames });
  }

  private scheduleMessage(messageFrames: MessageFrame[], cron: string): void {
    console.log('schedule message', { messageFrames, cron });

    const task = nodeCron.schedule(cron, () => {
      this.sendMessage(messageFrames);
    });
    this.scheduledTasks.push(task);
  }

  private async clearTasks(): Promise<void> {
    let scheduledTask = this.scheduledTasks.pop();
    while (scheduledTask) {
      await scheduledTask.destroy();
      scheduledTask = this.scheduledTasks.pop();
    }

    this.plannedTasks = [];
  }

  private async saveMessage(newMessage: Omit<Message, 'id'>): Promise<Message> {
    const message = new Message();
    message.executeAt = newMessage.executeAt;
    message.frames = newMessage.frames;
    return this.messageRepository.save(message);
  }
}
