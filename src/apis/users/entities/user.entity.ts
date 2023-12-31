import { Alert } from 'src/apis/alerts/entities/alert.entity';
import { Channel } from 'src/apis/channels/entities/channel.entity';
import { ChatBan } from 'src/apis/chatBans/entities/chatBans.entity';
import { Chat } from 'src/apis/chats/entities/chat.entity';
import { CreditHistory } from 'src/apis/creditHistories/entities/credit-history.entity';
import { Interest } from 'src/apis/interests/entities/interest.entity';
import { NoticeComment } from 'src/apis/noticeComments/entities/notice-comment.entity';
import { Payment } from 'src/apis/payments/entities/payment.entity';
import { Subscribe } from 'src/apis/subscribes/entities/subscribe.entity';
import { ViewHistory } from 'src/apis/viewHistories/entities/view-history.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ default: 0 })
  credit: number;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => Channel, (channel) => channel.user, { cascade: true })
  channel: Channel;

  @OneToMany(() => Interest, (interest) => interest.user, { cascade: true })
  interests: Interest[];

  @OneToMany(() => Payment, (payment) => payment.user, { cascade: true })
  payments: Payment[];

  @OneToMany(() => Subscribe, (subscribe) => subscribe.user, { cascade: true })
  subscribes: Subscribe[];

  @OneToMany(() => CreditHistory, (creditHistory) => creditHistory.user, {
    cascade: true,
  })
  creditHistories: CreditHistory[];

  @OneToMany(() => ViewHistory, (viewHistory) => viewHistory.user, {
    cascade: true,
  })
  viewHistories: ViewHistory[];

  @OneToMany(() => Chat, (chat) => chat.user, {
    cascade: true,
  })
  chats: Chat[];

  @OneToMany(() => NoticeComment, (noticeComment) => noticeComment.user, {
    cascade: true,
  })
  noticeComment: NoticeComment[];

  @OneToMany(() => Alert, (alert) => alert.user, {
    cascade: true,
  })
  alerts: Alert[];

  @OneToMany(() => ChatBan, (chatBan) => chatBan.user, {
    cascade: true,
  })
  chatBan: ChatBan[];
}
