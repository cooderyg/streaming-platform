import { Channel } from 'src/apis/channels/entities/channel.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Subscribe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.subscribes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.subscribes, {
    onDelete: 'CASCADE',
  })
  channel: Channel;
}
