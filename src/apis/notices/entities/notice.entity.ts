import { Channel } from 'src/apis/channels/entities/channel.entity';
import { NoticeComment } from 'src/apis/noticeComments/entities/notice-comment.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => NoticeComment, (noticeComment) => noticeComment.notice, {
    cascade: true,
  })
  noticeComment: NoticeComment[];

  @ManyToOne(() => Channel, (channel) => channel.notices, {
    onDelete: 'CASCADE',
  })
  channel: Channel;
}
