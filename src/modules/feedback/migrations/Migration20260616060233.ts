import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260616060233 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "feedback" drop column if exists "image_url";`);

    this.addSql(`alter table if exists "feedback" add column if not exists "image_urls" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "feedback" drop column if exists "image_urls";`);

    this.addSql(`alter table if exists "feedback" add column if not exists "image_url" text null;`);
  }

}
