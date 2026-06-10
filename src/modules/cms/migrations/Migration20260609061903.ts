import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260609061903 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "media" alter column "key" type text using ("key"::text);`);
    this.addSql(`alter table if exists "media" alter column "key" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "media" alter column "key" type text using ("key"::text);`);
    this.addSql(`alter table if exists "media" alter column "key" set not null;`);
  }

}
