import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
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

  private wsClients = [];

  handleConnection(@ConnectedSocket() socket: Socket): void {
    console.log(`${socket.id} 소켓 연결`);
    this.wsClients.push(socket);
    socket.join('test');
    // console.log(this.server.of('/').adapter.rooms);
    console.log(this.server.of('/').adapter.rooms.get('test')); // socketIO room은 map 객체임!
  }

  // 연결 끊길 시
  handleDisconnect(@ConnectedSocket() socket: Socket): void {
    // 룸에 아무도 없을 때 룸은 자동으로 삭제됨 따로 룸삭제 작업할 필요없음
    // 룸에는 socket id로 된 객체가 있기 때문에 스트리머의 socketId를 활용해서 룸에 입장하는 것도 괜찮을 듯
    console.log(`${socket.id} 소켓 연결 해제 ❌`);
    this.wsClients.splice(this.wsClients.indexOf(socket), 1);
    console.log(this.server.of('/').adapter.rooms.get('test'));
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    // 스트리밍 페이지를 나가면 자동으로 disconnect 되기 때문에 필요없을 것 같음 추가적인 작업이 있는 경우 사용
    client.leave(room);
  }

  @SubscribeMessage('broadcastStream')
  handleBroadcastStream(client: Socket, data: any) {
    const room = data.room;
    client.to(room).emit('stream', data.stream);
  }

  @SubscribeMessage('closeStream')
  handleStreamClose(client: Socket, room: string) {
    this.server.of('/').adapter.rooms.delete(room);
  }
}
