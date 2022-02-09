import { Body, Controller, Get, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtBody } from 'server/decorators/jwt_body.decorator';
import { JwtBodyDto } from 'server/dto/jwt_body.dto';
import { RoleKey } from 'server/entities/role.entity';
import { ProjectsService } from 'server/providers/services/projects.service';

@Controller()
export class ProjectsContoller {
  constructor(private projectsService: ProjectsService) {}

  @Get('/projects')
  public async index(@JwtBody() jwtBody: JwtBodyDto) {
    const projects = await this.projectsService.getProjectsUserIn(jwtBody.userId);
    return { projects };
  }

  @Get('/projects/:id')
  public async show(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number) {
    const authorized =
      jwtBody.roles.includes(RoleKey.ADMIN) ||
      (await this.projectsService.userIsRoleInProject(id, jwtBody.userId, RoleKey.TEAM_MEMBER));
    if (authorized) {
      const project = await this.projectsService.find(id);
      return { project };
    }
    throw new UnauthorizedException("You don't have permission to view this project");
  }

  @Post('/projects')
  public async create(@JwtBody() jwtBody: JwtBodyDto, @Body() projectPayload: any) {
    const project = await this.projectsService.create(projectPayload, jwtBody.userId);
    return { project };
  }
}
