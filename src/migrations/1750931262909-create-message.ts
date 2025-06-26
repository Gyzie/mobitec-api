import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessage1750931262909 implements MigrationInterface {
  name = 'CreateMessage1750931262909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "executeAt" varchar(255) NOT NULL, "frames" json NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "message"`);
  }
}
