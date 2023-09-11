import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatBan } from './entities/chatBans.entity';
import { Repository } from 'typeorm';
import {
  IChatBansServiceChatBanUser,
  IChatBansServiceDeleteBanUser,
  IChatBansServiceFindChatBan,
  IChatBansServiceFindChatBanUser,
} from './interfaces/chat-bans-service.interface';
import { UsersService } from '../users/users.service';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class ChatBanService {
  constructor(
    @InjectRepository(ChatBan)
    private readonly chatBanRepository: Repository<ChatBan>,
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
  ) {}

  // 밴유저 조회
  async findChatBan({
    userId,
    channelId,
  }: IChatBansServiceFindChatBan): Promise<ChatBan[]> {
    const channel = await this.channelsService.getChannel({
      channelId,
    });
    if (!channel) throw new NotFoundException('채널정보 확인을 해주세요.');
    if (
      channel.user.id === userId ||
      channel.role.manager.filter((el) => el === userId)
    ) {
      const chatBanUser = await this.chatBanRepository
        .createQueryBuilder('chatBan')
        .leftJoinAndSelect('chatBan.user', 'user')
        .where('chatBan.channel.id = :id', { id: channelId })
        .getMany();
      return chatBanUser;
    } else {
      throw new NotFoundException('권한이 없습니다.');
    }
  }

  // 밴유저 개별 조회
  async findChatBanUser({
    userId,
    channelId,
    email,
  }: IChatBansServiceFindChatBanUser): Promise<ChatBan> {
    const channel = await this.channelsService.getChannel({
      channelId,
    });

    const findUser = await this.usersService.findByEmail({ email });

    if (!channel) throw new NotFoundException('채널정보 확인을 해주세요.');
    if (
      channel.user.id === userId ||
      channel.role.manager.filter((el) => el === userId)
    ) {
      const banUser = await this.chatBanRepository.findOne({
        where: { user: { id: findUser.id }, channel: { id: channelId } },
      });
      if (!banUser) throw new NotFoundException('밴 유저를 찾지 못 했습니다.');
      return banUser;
    } else {
      throw new NotFoundException('권한이 없습니다.');
    }
  }

  // 유저 밴
  async chatBanUser({
    userId,
    channelId,
    createChatBanDto,
  }: IChatBansServiceChatBanUser): Promise<ChatBan> {
    const { userNickname, reason } = createChatBanDto;

    const channel = await this.channelsService.getChannel({
      channelId,
    });
    const banUser = await this.usersService.findByNickname({
      nickname: userNickname,
    });

    if (!channel) throw new NotFoundException('채널정보 확인해주세요.');
    if (!banUser) throw new NotFoundException('닉네임을 확인해주세요.');

    const findBanUser = await this.chatBanRepository.findOne({
      where: { user: { id: banUser.id }, channel: { id: channelId } },
    });
    if (findBanUser)
      throw new NotFoundException('이미 채팅이 금지된 유저입니다.');

    if (
      channel.user.id === userId ||
      channel.role.manager.filter((el) => el === userId)
    ) {
      const result = await this.chatBanRepository.save({
        user: { id: banUser.id },
        channel: { id: channelId },
        reason,
      });
      return result;
    } else {
      throw new NotFoundException('권한이 없습니다.');
    }
  }

  // 유저밴 풀기
  async banUserDelete({
    userId,
    channelId,
    email,
  }: IChatBansServiceDeleteBanUser): Promise<string> {
    const channel = await this.channelsService.getChannel({
      channelId,
    });
    const banUser = await this.usersService.findByEmail({
      email,
    });
    if (!channel) throw new NotFoundException('채널정보 확인을 해주세요.');
    if (
      channel.user.id === userId ||
      channel.role.manager.filter((el) => el === userId)
    ) {
      await this.chatBanRepository.softDelete({
        user: { id: banUser.id },
        channel: { id: channelId },
      });
      return '밴 해제 완료';
    } else {
      throw new NotFoundException('권한이 없습니다.');
    }
  }
}
