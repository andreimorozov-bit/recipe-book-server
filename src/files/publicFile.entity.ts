import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PublicFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  url: string;

  @Column()
  key: string;
}
