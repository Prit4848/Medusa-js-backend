import { MedusaService } from "@medusajs/framework/utils"
import { Feedback } from "./models/feedback"
import { ProductRatingStats } from "./models/product-rating-stats"

class FeedbackModuleService extends MedusaService({
  Feedback,
  ProductRatingStats,
}) {
  async recalculateProductStats(productId: string) {
    const feedbacks = await this.listFeedbacks({
      product_id: productId,
    })

    const reviewCount = feedbacks.length

    const averageRating =
      reviewCount === 0
        ? 0
        : feedbacks.reduce((sum, f) => sum + f.rating, 0) / reviewCount

    const popularityScore =
      averageRating * Math.log(reviewCount + 1)

    const existing = await this.listProductRatingStats({
      product_id: productId,
    })

    if (existing.length) {
      await this.updateProductRatingStats([
        {
          id: existing[0].id,
          average_rating: averageRating,
          review_count: reviewCount,
          popularity_score: popularityScore,
        },
      ])
    } else {
      await this.createProductRatingStats([
        {
          product_id: productId,
          average_rating: averageRating,
          review_count: reviewCount,
          popularity_score: popularityScore,
        },
      ])
    }
  }
}

export default FeedbackModuleService