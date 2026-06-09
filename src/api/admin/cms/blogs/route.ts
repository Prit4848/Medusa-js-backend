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
  
  data.published_at = new Date()
  if (!data.slug && data.title) {
    data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  }

  const blogs = await cmsService.createBlogs([data])
  res.json({ blog: blogs[0] })
}