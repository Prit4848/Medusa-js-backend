import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CMS_MODULE } from "../../../../../modules/cms"
import CmsModuleService from "../../../../../modules/cms/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  const blog = await cmsService.retrieveBlog(req.params.id)
  res.json({ blog })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  const data = req.body as any

  if (!data.slug && data.title) {
    data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  }

  const blogs = await cmsService.updateBlogs([{ id: req.params.id, ...data }])
  res.json({ blog: blogs[0] })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  await cmsService.deleteBlogs(req.params.id)
  res.json({ success: true })
}