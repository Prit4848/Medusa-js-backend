import { model } from "@medusajs/framework/utils"

export const Feedback = model.define("feedback", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  first_name: model.text(),
  last_name: model.text(),
  rating: model.number(),
  comment: model.text().nullable(),
  image_urls: model.json().nullable(),
})

export default Feedback