import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsContoller } from 'server/controllers/api/projects.controller';
import { ProjectsService } from 'server/providers/services/projects.service';
import { Project } from 'server/entities/project.entity';
import { UserRole } from 'server/entities/user_role.entity';
import { UsersModule } from './users.module';
import { UsersService } from 'server/providers/services/users.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Project, UserRole])],
  controllers: [ProjectsContoller],
  providers: [UsersService, ProjectsService],
  exports: [TypeOrmModule],
})
export class ProjectsModule {}
