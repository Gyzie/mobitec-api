import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import { MessageFrame } from './message.entity';
import { MessageService } from './message.service';

@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer()
  private server: Server;

  constructor(private messageService: MessageService) {
    this.messageService.subscribe((messageFrames) =>
      this.handleNewMessage(messageFrames),
    );
  }

  private handleNewMessage(messageFrames: MessageFrame[]): void {
    // Broadcast in a stupid way because this does not work?: this.server.emit('message', messageFrames);
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify(messageFrames));
    });
  }
}
