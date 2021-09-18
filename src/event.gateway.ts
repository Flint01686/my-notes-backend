import { Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { AuthGuard } from '@nestjs/passport';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CLIENT_HOST } from './constants';

@WebSocketGateway({
  cors: {
    origin: `https://${CLIENT_HOST}`,
    methods: ['GET', 'POST'],
    allowedHeaders: ['2911a686-181a-11ec-9621-0242ac130002'],
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
    this.logger.log('wss ok, bruh ' + CLIENT_HOST);
  }

  // @UseGuards(AuthGuard())
  @SubscribeMessage('refresher')
  handleMessage(client: Socket, command: string): void {
    this.ws.emit('refresher', command);
  }
}
