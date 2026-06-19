import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"

// GET /store/wishlist?customer_id=xxx
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customer_id = req.query.customer_id as string

  if (!customer_id) {
    return res.status(400).json({ error: "customer_id is required" })
  }

  const wishlistService: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE)
  const items = await wishlistService.listWishlistItems({ customer_id })

  return res.json({ items })
}

// POST /store/wishlist
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const {
    customer_id,
    product_id,
    variant_id,
    title,
    handle,
    thumbnail,
    price,
    category,
    in_stock,
  } = req.body as any

  if (!customer_id || !product_id) {
    return res.status(400).json({ error: "customer_id and product_id are required" })
  }

  const wishlistService: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE)

  // Check if already wishlisted
  const existing = await wishlistService.listWishlistItems({
    customer_id,
    product_id,
  })

  if (existing.length > 0) {
    return res.json({ item: existing[0], already_exists: true })
  }

  const item = await wishlistService.createWishlistItems({
    customer_id,
    product_id,
    variant_id,
    title,
    handle,
    thumbnail: thumbnail || null,
    price,
    category: category || null,
    in_stock: in_stock ?? true,
  })

  return res.status(201).json({ item })
}