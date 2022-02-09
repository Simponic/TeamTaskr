import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { UserRole } from './user_role.entity';

// Make sure to add aditional roles here then reseed
export enum RoleKey {
  ADMIN = 'admin',
  USER = 'user',
  TEAM_LEADER = 'team_leader',
  TEAM_MEMBER = 'team_member',
}

@Entity()
export class Role {
  static ROLES = [RoleKey.ADMIN, RoleKey.TEAM_LEADER, RoleKey.TEAM_MEMBER, RoleKey.USER];
  static compare(role1: RoleKey, role2: RoleKey) {
    // compare(role1, role2) such that (role1  > role2) => 1
    //                                 (role1  < role2) => -1
    //                                 (role1 == role2) => 0
    return Math.max(-1, Math.min(1, Role.ROLES.indexOf(role2) - Role.ROLES.indexOf(role1)));
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: RoleKey;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
