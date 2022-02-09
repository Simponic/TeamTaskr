import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'server/entities/project.entity';
import { UserRole } from 'server/entities/user_role.entity';
import { UsersService } from './users.service';
import { RoleKey } from 'server/entities/role.entity';
import { uniqueId } from 'lodash';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    private usersService: UsersService,
  ) {}

  find(id: number, relations: string[] = []) {
    return this.projectsRepository.findOne(id, { relations });
  }

  private async userContexts(userId: number) {
    return Array.from(new Set((await this.userRolesRepository.find({ userId })).map((x) => x.contextId)));
  }

  async getProjectsUserIn(userId: number) {
    return await this.projectsRepository.find({
      contextId: In(await this.userContexts(userId)),
    });
  }

  async userIsRoleInProject(projectId: number, userId: number, roleKey: RoleKey) {
    const context_id = (
      await this.projectsRepository.findOne({
        id: projectId,
      })
    ).contextId;
    return this.usersService.hasRoleInContext(userId, context_id, roleKey);
  }

  async create(projectPayload: any, userId: number) {
    const project = new Project();
    project.title = projectPayload.title;
    project.contextId = uniqueId();
    await this.usersService.addUserToRoleInContext(userId, project.contextId, RoleKey.TEAM_LEADER);
    return this.projectsRepository.save(project);
  }
}
