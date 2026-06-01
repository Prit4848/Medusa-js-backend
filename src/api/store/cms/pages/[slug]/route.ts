import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CMS_MODULE } from "../../../../../modules/cms"
import CmsModuleService from "../../../../../modules/cms/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE)
  const page = await cmsService.getPageBySlug(req.params.slug)

  if (!page) {
    return res.status(404).json({ message: "Page not found" })
  }

  res.json({ page })
}