import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'server/entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  find(id: number, relations: string[] = []) {
    return this.taskRepository.findOne(id, { relations });
  }

  async delete(id: number) {
    await this.taskRepository.delete(id);
    return { success: true };
  }

  async save(body: any) {
    await this.taskRepository.save(body);
    return { success: true };
  }
}
