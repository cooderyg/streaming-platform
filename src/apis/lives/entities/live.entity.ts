import { Channel } from 'src/apis/channels/entities/channel.entity';
import { Chat } from 'src/apis/chats/entities/chat.entity';
import { CreditHistory } from 'src/apis/creditHistories/entities/credit-history.entity';
import { Tag } from 'src/apis/tags/entities/tag.entity';
import { ViewHistory } from 'src/apis/viewHistories/entities/view-history.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Live {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  income: number;

  @Column({ nullable: true })
  replayUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => CreditHistory, (creditHistory) => creditHistory.live, {
    cascade: true,
  })
  creditHistories: CreditHistory[];

  @OneToMany(() => ViewHistory, (viewHistory) => viewHistory.live, {
    cascade: true,
  })
  viewHistories: ViewHistory[];

  @OneToMany(() => Chat, (chat) => chat.live, { cascade: true })
  chats: Chat[];

  @ManyToOne(() => Channel, (channel) => channel.lives, { onDelete: 'CASCADE' })
  channel: Channel;

  @JoinTable({ name: 'live_tag' })
  @ManyToMany(() => Tag, (tag) => tag.lives)
  tags: Tag[];
}
