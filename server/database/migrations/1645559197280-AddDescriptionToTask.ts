import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDescriptionToTask1645559197280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'task',
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('task', 'description');
  }
}
