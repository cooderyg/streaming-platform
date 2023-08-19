import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  wsClients = [];

  handleConnection(@ConnectedSocket() socket: Socket): void {
    console.log(`${socket.id} 소켓 연결`);
    this.wsClients.push(socket);
  }

  // 연결 끊길 시
  handleDisconnect(@ConnectedSocket() socket: Socket): void {
    console.log(`${socket.id} 소켓 연결 해제 ❌`);
    this.wsClients.splice(this.wsClients.indexOf(socket), 1);
  }
}
