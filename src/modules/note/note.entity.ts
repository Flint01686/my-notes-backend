import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column('text', { array: true, default: '{}' })
  attachments: string[];

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column({
    nullable: true,
  })
  owner?: string;

  @Column({
    nullable: true,
  })
  isPinned: boolean;
}
