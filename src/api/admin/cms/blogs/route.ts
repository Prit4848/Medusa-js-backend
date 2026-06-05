import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CMS_MODULE } from "../../../../modules/cms"
import CmsModuleService from "../../../../modules/cms/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  const blogs = await cmsService.listBlogs({})
  res.json({ blogs })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  const data = req.body as any
  
  if (data.status === "published" && !data.published_at) {
    data.published_at = new Date()
  }

  const blog = await cmsService.createBlogs(data)
  res.json({ blog })
}