import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConcept1751294686080 implements MigrationInterface {
  name = 'CreateConcept1751294686080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "concept" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(255) NOT NULL, "frames" json NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "concept"`);
  }
}
