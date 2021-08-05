import { Exclude } from 'class-transformer';
import { Recipe } from 'src/recipes/recipe.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @OneToMany((type) => Recipe, (recipe) => recipe.user, { eager: true })
  recipes: Recipe[];
}
