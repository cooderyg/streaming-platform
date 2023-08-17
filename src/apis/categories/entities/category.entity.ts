import { Channel } from 'src/apis/channels/entities/channel.entity';
import { Interest } from 'src/apis/interests/entities/interest.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Interest, (interest) => interest.category, { cascade: true })
  interests: Interest[];

  @ManyToMany(() => Channel, (channel) => channel.categories)
  channels: Channel[];
}
