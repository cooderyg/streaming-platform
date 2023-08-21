import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    if (typeof socket.handshake.headers['room-id'] !== 'string') return;

    const roomId: string = socket.handshake.headers['room-id'];

    socket.join(roomId);
    const accessToken = socket.handshake.headers.cookie
      ?.split('; ')
      ?.find((cookie: string) => cookie.startsWith('accessToken'))
      ?.split('=')[1];
    if (!accessToken) {
    } else {
      let userId: string;
      try {
        const payload = this.jwtService.verify(accessToken, {
          secret: process.env.ACCESS_SECRET_KEY,
        });
        // eslint-disable-next-line prefer-const
        userId = payload.sub;

        const user = await this.usersService.findById({ userId });
        if (user) {
          socket.data.user = user;
        }
      } catch (error) {}
    }
    console.log(this.server.of('/').adapter.rooms);

    const userCount = this.server.of('/').adapter.rooms.get(roomId).size;

    this.server.of('/').to(roomId).emit('userCount', { userCount });
    // console.log(this.server.of('/').adapter.rooms);
    // console.log(this.server.of('/').adapter.rooms.get('test')); // socketIO room은 map 객체임!
  }

  // 프론트에서 연결 끊길 시
  handleDisconnect(@ConnectedSocket() socket: Socket): void {
    // 룸에 아무도 없을 때 룸은 자동으로 삭제됨 따로 룸삭제 작업할 필요없음
    // 룸에는 socket id로 된 객체가 있기 때문에 스트리머의 socketId를 활용해서 룸에 입장하는 것도 괜찮을 듯
    if (typeof socket.handshake.headers['room-id'] !== 'string') return;

    const roomId: string = socket.handshake.headers['room-id'];

    console.log(`${socket.id} 소켓 연결 해제 ❌`);

    const userCount = this.server.of('/').adapter.rooms.get(roomId)?.size;

    this.server.of('/').to(roomId).emit('userCount', { userCount });
  }

  @SubscribeMessage('chat')
  handleChat(@ConnectedSocket() socket: Socket, @MessageBody() data): void {
    // 방 전체에 emit하기
    const { chat } = data;
    const roomId = socket.handshake.headers['room-id'];
    const user = socket.data.user;
    console.log('유저', user);
    console.log('룸아이디', roomId);
    console.log('데이터', data);
    this.server.of('/').to(roomId).emit('chat', {
      user,
      chat,
    });
  }

  @SubscribeMessage('donation')
  handleDonation(@ConnectedSocket() socket: Socket, @MessageBody() data): void {
    const user = socket.data.user;
    const { roomId, amount } = data;
    this.server.of('/').to(roomId).emit('donation', {
      nickname: user.nickname,
      amount,
    });
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

  // @SubscribeMessage('createRoom')
  // handleCreateRoom(client: Socket, room: string) {
  //   // client.join(room);
  // }

  // @SubscribeMessage('leaveRoom')
  // handleLeaveRoom(client: Socket, room: string) {
  //   // 스트리밍 페이지를 나가면 자동으로 disconnect 되기 때문에 필요없을 것 같음 추가적인 작업이 있는 경우 사용
  //   client.leave(room);
  // }
}
