import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { CMS_MODULE } from "../../../../modules/cms"
import CmsModuleService from "../../../../modules/cms/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  
  const page = parseInt(req.query.page as string) || 1
  const perPage = parseInt(req.query.perPage as string) || 20
  const search = req.query.q as string

  const [items, count] = await cmsService.listAndCountMedia(
    search ? { url: { $ilike: `%${search}%` } } : {},
    {
      skip: (page - 1) * perPage,
      take: perPage,
      order: { created_at: "DESC" }
    }
  )

  res.json({
    items: items.map(i => ({
      id: i.id,
      url: i.url,
      title: i.key,
    })),
    total: count,
    page,
    perPage,
    totalPages: Math.ceil(count / perPage)
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  
  // Medusa v2 multi-part form data handling is usually done via a middleware 
  // or we can handle it manually. Medusa's default admin routes for uploads 
  // handle it. For a custom route, we might need to ensure the request is parsed.
  
  // Actually, Medusa v2 might not automatically parse multipart in custom routes 
  // unless configured. But let's try to use the core workflow if we have the files.
  
  const files = req.files as any[]
  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" })
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: files.map(f => ({
        filename: f.originalname,
        mimeType: f.mimetype,
        content: f.buffer.toString("base64"),
        access: "public"
      }))
    }
  })

  const uploadedFile = result[0]
  
  const media = await cmsService.createMedia({
    url: uploadedFile.url,
    key: uploadedFile.id, // Use id as a fallback for key
    mime_type: files[0].mimetype,
    size: files[0].size,
  })

  res.json({
    id: media.id,
    url: media.url,
    title: media.key,
  })
}
