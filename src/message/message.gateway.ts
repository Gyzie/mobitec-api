import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { MessageFrame } from './message.entity';
import { MessageService } from './message.service';
import { IncomingMessage } from 'http';
import { AUTH_KEY_HEADER, isValidAuthKey } from 'src/guards/auth.guard';

@WebSocketGateway()
export class MessageGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  constructor(private messageService: MessageService) {
    this.messageService.subscribe((messageFrames) =>
      this.handleNewMessage(messageFrames),
    );
  }

  handleConnection(client: WebSocket, message: IncomingMessage) {
    const key = message.headers?.[AUTH_KEY_HEADER];
    if (typeof key !== 'string' || !isValidAuthKey(key)) {
      client.close(4403, 'Missing or invalid auth-key header');
    }
  }

  private handleNewMessage(messageFrames: MessageFrame[]): void {
    // Broadcast in a stupid way because this does not work?: this.server.emit('message', messageFrames);
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify(messageFrames));
    });
  }
}
