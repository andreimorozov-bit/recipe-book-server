import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { PublicFile } from 'src/files/publicFile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ingredient } from './models/ingredient';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column()
  rating: number;

  @Column()
  servings: number;

  @Column('jsonb', { nullable: true })
  ingredients?: Ingredient[];

  @ManyToOne((type) => User, (user) => user.recipes, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;

  @Column({ name: 'image_name', nullable: true })
  imageName: string;

  @JoinColumn()
  @OneToOne(() => PublicFile, { eager: true, nullable: true })
  image?: PublicFile;
}
