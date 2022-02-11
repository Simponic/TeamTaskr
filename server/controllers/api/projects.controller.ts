import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { JwtBody } from 'server/decorators/jwt_body.decorator';
import { JwtBodyDto } from 'server/dto/jwt_body.dto';
import { RoleKey } from 'server/entities/role.entity';
import { ProjectsService } from 'server/providers/services/projects.service';

@Controller()
export class ProjectsContoller {
  constructor(private projectsService: ProjectsService) {}

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
      const project = await this.projectsService.find(id);
      return { project };
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
  }

  @Delete('/projects/:id')
  public async delete(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number) {
    if (await this.authorized(jwtBody, id, RoleKey.TEAM_LEADER)) {
      return await this.projectsService.delete(id);
    }
    return { success: false, message: "You don't have permission to delete this project" };
  }
}
