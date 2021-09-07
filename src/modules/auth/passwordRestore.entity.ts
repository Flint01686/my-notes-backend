import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class PassRestore {
  @PrimaryColumn()
  email: string;

  @Column()
  token: string;
}
