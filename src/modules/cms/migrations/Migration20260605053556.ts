import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260605053556 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "blog" drop column if exists "content_css";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "blog" add column if not exists "content_css" text null;`);
  }

}
