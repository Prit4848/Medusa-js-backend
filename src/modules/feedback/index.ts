import { Module } from "@medusajs/framework/utils"
import FeedbackModuleService from "./service"
export { ProductRatingStats } from "./models/product-rating-stats"
export const FEEDBACK_MODULE = "feedback"

export default Module(FEEDBACK_MODULE, {
  service: FeedbackModuleService,
})