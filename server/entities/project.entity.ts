import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contextId: string;

  @Column()
  title: string;

  @OneToMany(() => Task, (task) => task.project, { cascade: true })
  tasks: Task[];
}
