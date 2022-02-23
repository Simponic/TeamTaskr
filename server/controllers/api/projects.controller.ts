import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { JwtBody } from 'server/decorators/jwt_body.decorator';
import { JwtBodyDto } from 'server/dto/jwt_body.dto';
import { RoleKey } from 'server/entities/role.entity';
import { ProjectsService } from 'server/providers/services/projects.service';
import { pick } from 'lodash';
import { TasksService } from 'server/providers/services/tasks.service';
import { Task } from 'server/entities/task.entity';
import { UsersService } from 'server/providers/services/users.service';

@Controller()
export class ProjectsContoller {
  constructor(
    private usersService: UsersService,
    private tasksService: TasksService,
    private projectsService: ProjectsService,
  ) {}

  private async authorized(jwtBody: JwtBodyDto, projectId: number, roleKey: RoleKey) {
    const authorized =
      jwtBody.roles.includes(RoleKey.ADMIN) ||
      (await this.projectsService.userIsRoleInProject(projectId, jwtBody.userId, roleKey));
    return authorized;
  }

  @Get('/projects')
  public async index(@JwtBody() jwtBody: JwtBodyDto) {
    const projects = await this.projectsService.getProjectsUserIn(jwtBody.userId);
    return { projects };
  }

  @Get('/projects/:id')
  public async show(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number) {
    if (await this.authorized(jwtBody, id, RoleKey.TEAM_MEMBER)) {
      const project = await this.projectsService.find(id, ['tasks', 'tasks.user']);
      const users = (await this.projectsService.usersInProject(id)).map((user) =>
        pick(user, ['id', 'firstName', 'lastName']),
      );
      return { success: true, ...project, users };
    }
    return { success: false, message: "You don't have permission to view this project" };
  }

  @Post('/projects')
  public async create(@JwtBody() jwtBody: JwtBodyDto, @Body() projectPayload: any) {
    const project = await this.projectsService.create(projectPayload, jwtBody.userId);
    return { project };
  }

  @Post('/projects/:id/users')
  public async addUser(@JwtBody() jwtBody: JwtBodyDto, @Body() userPayload: any, @Param('id') id: number) {
    if (await this.authorized(jwtBody, id, RoleKey.TEAM_LEADER)) {
      return await this.projectsService.addUserToProject(id, userPayload.email);
    }
    return { success: false, message: "You don't have permission to add new users" };
  }

  @Put('/projects/:id/users')
  public async removeUser(@JwtBody() jwtBody: JwtBodyDto, @Body() userPayload: any, @Param('id') id: number) {
    if (await this.authorized(jwtBody, id, RoleKey.TEAM_LEADER)) {
      const tasks = await (await this.projectsService.find(id, ['tasks', 'tasks.user'])).tasks;
      for (const task of tasks) {
        if (task.user.email === userPayload.email) {
          task.user = null;
          await this.tasksService.save(task);
        }
      }
      return await this.projectsService.removeUserFromProject(id, userPayload.email);
    }
    return { success: false, message: "You don't have permission to remove users" };
  }

  @Delete('/projects/:id')
  public async remove(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number) {
    if (await this.authorized(jwtBody, id, RoleKey.TEAM_LEADER)) {
      return await this.projectsService.delete(id);
    }
    return { success: false, message: "You don't have permission to delete this project" };
  }

  @Post('/projects/:id/tasks')
  public async addTask(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number, @Body() taskPayload: any) {
    await this.tasksService.create(taskPayload, jwtBody.userId, id);
    return { success: true };
  }

  @Delete('/projects/tasks/:id')
  public async removeTask(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number) {
    const task: Task = await this.tasksService.find(id, ['project', 'user']);
    if (await this.authorized(jwtBody, task.project.id, RoleKey.TEAM_LEADER)) {
      return await this.tasksService.delete(id);
    }
    return { success: false, message: 'Only project creator can delete tasks' };
  }

  @Put('/projects/tasks/:id')
  public async updateTask(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number, @Body() taskPayload: any) {
    const task: Task = await this.tasksService.find(id, ['project', 'user']);
    const isTeamLeader = await this.authorized(jwtBody, task.project.id, RoleKey.TEAM_LEADER);
    const isTeamMember = await this.authorized(jwtBody, task.project.id, RoleKey.TEAM_MEMBER);
    if (isTeamLeader || (task.user && task.user.id == jwtBody.userId)) {
      // User can update all fields in a task (besides assignee) if they are the task assignee or a team leader
      if (taskPayload.userId != jwtBody.userId && !isTeamLeader) {
        return { success: false, message: "You are currently assigned this task; you can't assign someone else" };
      } else {
        task.user = await this.usersService.find(taskPayload.userId);
      }
      return await this.tasksService.save({ ...task, ...taskPayload });
    } else if (!task.user && isTeamMember) {
      // User can assign themselves to a task if they are a team member and the task is not assigned to anyone
      console.log(taskPayload, jwtBody);
      if (taskPayload.userId == jwtBody.userId) {
        task.user = await this.usersService.find(jwtBody.userId);
        return await this.tasksService.save(task);
      } else {
        return { success: false, message: "You can't assign someone else to that task" };
      }
    }
    return { success: false, message: "You don't have permission to update that task" };
  }
}
