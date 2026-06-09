import { model } from "@medusajs/framework/utils"

export const Media = model.define("media", {
  id: model.id().primaryKey(),
  url: model.text(),
  key: model.text().nullable(),
  mime_type: model.text().nullable(),
  size: model.number().nullable(),
  metadata: model.json().nullable(),
})

export default Media
