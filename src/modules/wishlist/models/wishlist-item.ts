import { model } from "@medusajs/framework/utils"

const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  product_id: model.text(),
  variant_id: model.text(),
  title: model.text(),
  handle: model.text(),
  thumbnail: model.text().nullable(),
  price: model.number(),
  category: model.text().nullable(),
  in_stock: model.boolean().default(true),
})

export default WishlistItem