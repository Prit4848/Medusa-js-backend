import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260605053959 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "blog" add column if not exists "content_json" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "blog" drop column if exists "content_json";`);
  }

}
