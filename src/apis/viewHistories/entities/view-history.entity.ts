import { Live } from 'src/apis/lives/entities/live.entity';
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
export class ViewHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.viewHistories, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Live, (live) => live.viewHistories, { onDelete: 'CASCADE' })
  live: Live;
}
