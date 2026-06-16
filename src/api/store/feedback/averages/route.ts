import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FEEDBACK_MODULE } from "../../../../modules/feedback"
import FeedbackModuleService from "../../../../modules/feedback/service"

/**
 * GET  /store/feedback/averages?product_ids=id1,id2
 *   → kept for backwards compat with small requests (e.g. single product page)
 *
 * POST /store/feedback/averages
 *   body: { product_ids: string[] }
 *   → use this from the shop page to avoid query-string length limits
 *     when passing 100–500 product IDs at once.
 */

type AverageEntry = {
  average: number
  count: number
  popularity_score: number
}

async function resolveAverages(
  feedbackService: FeedbackModuleService,
  productIds: string[]
): Promise<Record<string, AverageEntry>> {
  if (!productIds.length) return {}

  const stats = await feedbackService.listProductRatingStats({
    product_id: { $in: productIds },  // ← fix here
  })

  const averages: Record<string, AverageEntry> = {}

  for (const stat of stats) {
    averages[stat.product_id] = {
      average: stat.average_rating ?? 0,
      count: stat.review_count ?? 0,
      popularity_score: stat.popularity_score ?? 0,
    }
  }

  return averages
}

// ── GET (backwards compat — single product page, small sets) ────────────────
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const feedbackService: FeedbackModuleService =
    req.scope.resolve(FEEDBACK_MODULE)

  const raw = req.query.product_ids as string | undefined
  const productIds = raw?.split(",").map((s) => s.trim()).filter(Boolean) ?? []

  if (!productIds.length) {
    return res.status(400).json({ message: "product_ids is required" })
  }

  // Safety cap on GET — if someone passes >50 IDs via GET, reject and tell
  // them to use POST instead.
  if (productIds.length > 50) {
    return res.status(400).json({
      message:
        "Too many product_ids for a GET request. Use POST /store/feedback/averages with a JSON body instead.",
    })
  }

  const averages = await resolveAverages(feedbackService, productIds)
  res.json({ averages })
}

// ── POST (shop page — handles large batches safely) ─────────────────────────
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const feedbackService: FeedbackModuleService =
    req.scope.resolve(FEEDBACK_MODULE)

  const body = req.body as { product_ids?: unknown }
  const productIds = Array.isArray(body?.product_ids)
    ? (body.product_ids as string[]).map((s) => String(s).trim()).filter(Boolean)
    : []

  if (!productIds.length) {
    return res.status(400).json({ message: "product_ids array is required in body" })
  }

  // Hard cap — no single request should ask for more than 500
  const capped = productIds.slice(0, 500)

  const averages = await resolveAverages(feedbackService, capped)
  res.json({ averages })
}