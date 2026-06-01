import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260528065818 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "blog" ("id" text not null, "title" text not null, "slug" text not null, "content" text not null, "author" text not null, "thumbnail" text null, "tags" text[] null, "status" text check ("status" in ('draft', 'published')) not null default 'draft', "published_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blog_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_deleted_at" ON "blog" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "page" ("id" text not null, "title" text not null, "slug" text not null, "content" text not null, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "meta_title" text null, "meta_desc" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "page_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_page_deleted_at" ON "page" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blog" cascade;`);

    this.addSql(`drop table if exists "page" cascade;`);
  }

}
