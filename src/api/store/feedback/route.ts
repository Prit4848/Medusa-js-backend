import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { FEEDBACK_MODULE } from "../../../modules/feedback"
import FeedbackModuleService from "../../../modules/feedback/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const feedbackService: FeedbackModuleService = req.scope.resolve(FEEDBACK_MODULE)

  const product_id = req.query.product_id as string
  if (!product_id) {
    return res.status(400).json({ message: "product_id is required" })
  }

  const [items, count] = await feedbackService.listAndCountFeedbacks(
    { product_id },
    { order: { created_at: "DESC" } }
  )

  res.json({ feedback: items, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const feedbackService: FeedbackModuleService = req.scope.resolve(FEEDBACK_MODULE)

  const { product_id, first_name, last_name, rating, comment } = req.body as any
  const files = req.files as any[]

  let image_urls: string[] | null = null

  if (files && files.length > 0) {
    const { result } = await uploadFilesWorkflow(req.scope).run({
      input: {
        files: files.map(f => ({
          filename: f.originalname,
          mimeType: f.mimetype,
          content: f.buffer.toString("base64"),
          access: "public",
        })),
      },
    })
    image_urls = result.map((r: any) => r.url)
  }

  const feedback = await feedbackService.createFeedbacks({
  product_id,
  first_name,
  last_name,
  rating: Number(rating),
  comment: comment || null,
  image_urls: image_urls as unknown as Record<string, unknown> | null,
})

  // ← Recalculate and cache stats after every new submission
  await feedbackService.recalculateProductStats(product_id)

  res.status(201).json({ feedback })
}