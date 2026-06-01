import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CMS_MODULE } from "../../../../../modules/cms"
import CmsModuleService from "../../../../../modules/cms/service"

// GET single page
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  const page = await cmsService.retrievePage(req.params.id)
  res.json({ page })
}

// PUT update page
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  const page = await cmsService.updatePages({ id: req.params.id, ...req.body as any })
  res.json({ page })
}

// DELETE page
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  await cmsService.deletePages(req.params.id)
  res.json({ success: true })
}