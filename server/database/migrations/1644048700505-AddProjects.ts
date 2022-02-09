import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddProjects1644048700505 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'project',
        columns: [
          {
            name: 'id',
            isPrimary: true,
            isGenerated: true,
            type: 'int',
          },
          {
            name: 'title',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'contextId',
            type: 'text',
            isNullable: false,
          },
        ],
      }),
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('project');
  }
}
