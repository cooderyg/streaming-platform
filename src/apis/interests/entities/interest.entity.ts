import { Category } from 'src/apis/categories/entities/category.entity';
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
export class Interest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Category, (category) => category.interests, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @ManyToOne(() => User, (user) => user.interests, {
    onDelete: 'CASCADE',
  })
  user: User;
}
