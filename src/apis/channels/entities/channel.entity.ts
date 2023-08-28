import { Alert } from 'src/apis/alerts/entities/alert.entity';
import { Category } from 'src/apis/categories/entities/category.entity';
import { Live } from 'src/apis/lives/entities/live.entity';
import { Notice } from 'src/apis/notices/entities/notice.entity';
import { Subscribe } from 'src/apis/subscribes/entities/subscribe.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class ChannelRole {
  manager: string[];
}

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'simple-json' })
  role: ChannelRole;

  @Column({ default: 0 })
  income: number;

  @Column({ nullable: true })
  profileImgUrl: string;

  @Column({ nullable: true })
  bannerImgUrl: string;

  @Column({ nullable: true })
  introduction: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => User, (user) => user.channel, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Subscribe, (subscribe) => subscribe.channel, {
    cascade: true,
  })
  subscribes: Subscribe[];

  @OneToMany(() => Notice, (notice) => notice.channel, {
    cascade: true,
  })
  notices: Notice[];

  @OneToMany(() => Live, (live) => live.channel, {
    cascade: true,
  })
  lives: Live[];

  @OneToMany(() => Alert, (alert) => alert.channel, {
    cascade: true,
  })
  alerts: Alert[];

  @JoinTable({ name: 'category_channel' })
  @ManyToMany(() => Category, (category) => category.channels)
  categories: Category[];
}
