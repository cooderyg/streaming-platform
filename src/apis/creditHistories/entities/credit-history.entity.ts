import { Live } from 'src/apis/lives/entities/live.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CreditHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.creditHistories, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Live, (live) => live.creditHistories, {
    onDelete: 'CASCADE',
  })
  live: Live;
}
