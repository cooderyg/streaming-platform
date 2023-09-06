import { Injectable } from '@nestjs/common';
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
import {
  IEventsGatewayHandleChat,
  IEventsGatewayHandleDonation,
} from './interfaces/events-gateway.interface';
import { ChatsService } from '../chats/chats.service';
import { CreateChatDto } from '../chats/dto/create-chat.dto';

// interface IEventGatewayOnAirStreamers {
//   socket: Socket;
//   liveId: string;
// }

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer()
  server: Server;

  // onAirStreamers: IEventGatewayOnAirStreamers[] = [];

  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    if (typeof socket.handshake.headers['room-id'] !== 'string') return;

    const roomId: string = socket.handshake.headers['room-id'];

    socket.join(roomId);

    const userCount = this.server.of('/').adapter.rooms.get(roomId).size;

    this.server.of('/').to(roomId).emit('userCount', { userCount });
  }

  // 프론트에서 연결 끊길 시
  handleDisconnect(@ConnectedSocket() socket: Socket): void {
    // 룸에 아무도 없을 때 룸은 자동으로 삭제됨 따로 룸삭제 작업할 필요없음
    if (typeof socket.handshake.headers['room-id'] !== 'string') return;

    const roomId: string = socket.handshake.headers['room-id'];

    console.log(`${socket.id} 소켓 연결 해제 ❌`);

    const userCount = this.server.of('/').adapter.rooms.get(roomId)?.size;

    this.server.of('/').to(roomId).emit('userCount', { userCount });
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: IEventsGatewayHandleChat,
  ): void {
    // 방 전체에 emit하기
    const { chat } = data;
    let user = data?.user;

    if (!user) {
      user = socket.data.user;
    } else {
      socket.data.user = user;
    }

    const roomId = socket.handshake.headers['room-id'];

    console.log('유저', user);
    console.log('룸아이디', roomId);
    console.log('데이터', data);
    this.server.of('/').to(roomId).emit('chat', {
      user,
      chat,
    });

    // mongoDB에 채팅 저장
    const createChatDto: CreateChatDto = {
      liveId: roomId.toString(),
      userId: user.id,
      nickname: user.nickname,
      content: data.chat,
    };
    this.chatsService.createChat(createChatDto);
  }

  @SubscribeMessage('donation')
  handleDonation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: IEventsGatewayHandleDonation,
  ): void {
    let user = data?.user;

    if (!user) {
      user = socket.data.user;
    } else {
      socket.data.user = user;
    }

    const { roomId, amount } = data;
    this.server.of('/').to(roomId).emit('donation', {
      nickname: user.nickname,
      amount,
    });
  }

  // @SubscribeMessage('createLive')
  // handleCreateLive(@ConnectedSocket() socket: Socket) {
  //   if (typeof socket.handshake.headers['room-id'] !== 'string') return;
  //   const liveId: string = socket.handshake.headers['room-id'];

  //   const temp = {
  //     socket,
  //     liveId,
  //   };
  //   this.onAirStreamers.push(temp);
  //   console.log(this.onAirStreamers);
  // }

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
