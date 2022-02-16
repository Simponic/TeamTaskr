import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsContoller } from 'server/controllers/api/projects.controller';
import { ProjectsService } from 'server/providers/services/projects.service';
import { Project } from 'server/entities/project.entity';
import { UserRole } from 'server/entities/user_role.entity';
import { UsersModule } from './users.module';
import { UsersService } from 'server/providers/services/users.service';
import { Task } from 'server/entities/task.entity';
import { TasksService } from 'server/providers/services/tasks.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Project, UserRole, Task])],
  controllers: [ProjectsContoller],
  providers: [UsersService, ProjectsService, TasksService],
  exports: [TypeOrmModule],
})
export class ProjectsModule {}
