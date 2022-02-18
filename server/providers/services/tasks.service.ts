import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'server/entities/task.entity';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { UsersService } from './users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private usersService: UsersService,
    private projectsService: ProjectsService,
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

  async create(taskPayload: any, userId: number, projectId: number) {
    const task = new Task();
    task.title = taskPayload.title;
    task.estimate = taskPayload.estimate;
    task.description = taskPayload.description;
    task.project = await this.projectsService.find(projectId);
    task.user = await this.usersService.find(userId);
    return this.taskRepository.save(task);
  }
}
