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

  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    if (typeof socket.handshake.headers['room-id'] !== 'string') return;

    const roomId: string = socket.handshake.headers['room-id'];
    if (roomId) {
      socket.join(roomId);

      const userCount = this.server.of('/').adapter.rooms.get(roomId).size;

      this.server.of('/').to(roomId).emit('userCount', { userCount });
    } else {
      if (typeof socket.handshake.headers['channel-ids'] !== 'string') return;

      const channelIds: string[] = JSON.parse(
        socket.handshake.headers['channel-ids'],
      ).channelIds;

      channelIds.forEach((channelId) => {
        socket.join(channelId);
      });
    }
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

    this.server.of('/').to(roomId).emit('chat', {
      user,
      chat,
    });

    // mongoDB에 채팅 저장
    const createChatDto: CreateChatDto = {
      liveId: roomId.toString(),
      userId: user.id,
      email: user.email,
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

  @SubscribeMessage('ban')
  handleBanUser(@ConnectedSocket() socket: Socket) {
    const roomId = socket.handshake.headers['room-id'];
    this.server.of('/').to(roomId).emit('ban');
  }
}
