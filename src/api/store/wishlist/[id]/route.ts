import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../../modules/wishlist"
import WishlistModuleService from "../../../../modules/wishlist/service"

// DELETE /store/wishlist/:id
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  const wishlistService: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE)
  await wishlistService.deleteWishlistItems(id)

  return res.json({ success: true })
}