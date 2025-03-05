import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSubjectSesIdToMassEmailRecord1741126520725 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('mass_email_record');
    if (table) {
      const subject = table.findColumnByName('subject');
      if (!subject) {
        await queryRunner.addColumn(
          table,
          new TableColumn({
            name: 'subject',
            type: 'varchar',
            length: '255',
            default: "''",
          }),
        );
      }
      const sesIds = table.findColumnByName('message_ids');
      if (!sesIds) {
        await queryRunner.addColumn(
          table,
          new TableColumn({
            name: 'message_ids',
            type: 'jsonb',
            isNullable: true,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('mass_email_record');
    if (table) {
      const subject = table.findColumnByName('subject');
      if (subject) {
        await queryRunner.dropColumn(table, subject);
      }
      const sesIds = table.findColumnByName('message_ids');
      if (sesIds) {
        await queryRunner.dropColumn(table, sesIds);
      }
    }
  }
}
