import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260616073315 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_rating_stats" ("id" text not null, "product_id" text not null, "average_rating" real not null default 0, "review_count" integer not null default 0, "popularity_score" real not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_rating_stats_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_rating_stats_deleted_at" ON "product_rating_stats" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_rating_stats" cascade;`);
  }

}
