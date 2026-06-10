import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260605053102 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "blog" add column if not exists "content_html" text null, add column if not exists "content_css" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "blog" drop column if exists "content_html", drop column if exists "content_css";`);
  }

}
