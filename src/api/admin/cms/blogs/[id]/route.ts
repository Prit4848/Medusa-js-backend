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
  const blog = await cmsService.updateBlogs({ id: req.params.id, ...req.body as any })
  res.json({ blog })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  await cmsService.deleteBlogs(req.params.id)
  res.json({ success: true })
}