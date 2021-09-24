import { Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_HOST ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'authorization'],
    credentials: true,
  },
})
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() ws: Server;
  private logger: Logger = new Logger('EventGateway');

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('wss ok, bruh ' + process.env.CLIENT_HOST);
  }

  // @UseGuards(AuthGuard())
  @SubscribeMessage('refresher')
  handleMessage(client: Socket, command: string): void {
    this.ws.emit('refresher', command);
  }
}
