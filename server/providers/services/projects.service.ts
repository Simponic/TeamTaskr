import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'server/entities/project.entity';
import { UserRole } from 'server/entities/user_role.entity';
import { UsersService } from './users.service';
import { RoleKey } from 'server/entities/role.entity';
import { v4 as uuidv4 } from 'uuid';

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

  async getProjectsUserIn(userId: number) {
    return await this.projectsRepository.find({
      where: {
        contextId: In(await this.usersService.userContexts(userId)),
      },
      order: {
        id: 'DESC',
      },
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
    project.contextId = uuidv4();
    await this.usersService.addUserToRoleInContext(userId, project.contextId, RoleKey.TEAM_LEADER, RoleKey.TEAM_MEMBER);
    return this.projectsRepository.save(project);
  }

  async delete(id: number) {
    const context_id = (
      await this.projectsRepository.findOne({
        id: id,
      })
    ).contextId;
    await this.projectsRepository.delete(id);
    await this.userRolesRepository.delete({ contextId: context_id });
    return { success: true };
  }

  async addUserToProject(projectId: number, userEmail: string) {
    const user = await this.usersService.findBy({ email: userEmail });
    if (!user) return { success: false, message: 'User not found' };

    const project = await this.projectsRepository.findOne({
      id: projectId,
    });
    if (!(await this.usersService.hasRoleInContext(user.id, project.contextId, RoleKey.TEAM_MEMBER))) {
      await this.usersService.addUserToRoleInContext(user.id, project.contextId, RoleKey.TEAM_MEMBER);
      return { success: true };
    } else {
      return { success: false, message: 'User is already in this project' };
    }
  }

  async removeUserFromProject(projectId: number, userEmail: string) {
    const user = await this.usersService.findBy({ email: userEmail });
    if (!user) return { success: false, message: 'User not found' };

    const project = await this.projectsRepository.findOne({
      id: projectId,
    });
    if (await this.usersService.hasRoleInContext(user.id, project.contextId, RoleKey.TEAM_MEMBER)) {
      await this.usersService.removeUserInContext(user.id, project.contextId);
      return { success: true };
    } else {
      return { success: false, message: 'User is not in this project' };
    }
  }

  async usersInProject(projectId: number) {
    const users = await this.userRolesRepository
      .createQueryBuilder('user_role')
      .select('"userId"')
      .where('"contextId" = :contextId', { contextId: (await this.projectsRepository.findOne(projectId)).contextId })
      .distinctOn(['"userId"'])
      .getRawMany();
    return await this.usersService.findAllBy({
      where: {
        id: In(users.map((user) => user.userId)),
      },
    });
  }
}
