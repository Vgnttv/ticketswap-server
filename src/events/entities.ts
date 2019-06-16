import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { IsString, Length, MinLength, IsUrl, IsDate } from 'class-validator';
import { Ticket } from '../tickets/entity';
import User from '../users/entity';

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @IsString()
  @Length(2, 25)
  @Column('text')
  name: string;

  @IsString()
  @MinLength(5)
  @Column('text')
  description: string;

  @IsUrl()
  @Column('text')
  picture: string;

  // @IsDate()
  @Column('date')
  startDate: Date;

  // @IsDate()
  @Column('date')
  endDate: Date;

  @Column("integer", { name: "user_id" })
  userId: number;

  @OneToMany(_ => Ticket, tickets => tickets.event, { eager: true })
  tickets: Ticket[];

  @ManyToOne(_ => User, user => user.events)
  user: User[];
}