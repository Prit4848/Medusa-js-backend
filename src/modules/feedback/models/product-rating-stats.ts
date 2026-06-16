import { model } from "@medusajs/framework/utils"

export const ProductRatingStats = model.define(
  "product_rating_stats",
  {
    id: model.id().primaryKey(),

    product_id: model.text(),

    average_rating: model.float().default(0),

    review_count: model.number().default(0),

    popularity_score: model.float().default(0),
  }
)