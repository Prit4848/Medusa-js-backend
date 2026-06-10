import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260609060724 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "media" ("id" text not null, "url" text not null, "key" text not null, "mime_type" text null, "size" integer null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "media_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_media_deleted_at" ON "media" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "blog" alter column "slug" type text using ("slug"::text);`);
    this.addSql(`alter table if exists "blog" alter column "slug" drop not null;`);
    this.addSql(`alter table if exists "blog" alter column "author" type text using ("author"::text);`);
    this.addSql(`alter table if exists "blog" alter column "author" set default 'Admin';`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "media" cascade;`);

    this.addSql(`alter table if exists "blog" alter column "slug" type text using ("slug"::text);`);
    this.addSql(`alter table if exists "blog" alter column "slug" set not null;`);
    this.addSql(`alter table if exists "blog" alter column "author" drop default;`);
    this.addSql(`alter table if exists "blog" alter column "author" type text using ("author"::text);`);
  }

}
