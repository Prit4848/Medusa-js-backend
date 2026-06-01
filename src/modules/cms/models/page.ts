import { model } from "@medusajs/framework/utils"

const Page = model.define("page", {
  id:          model.id().primaryKey(),
  title:       model.text(),
  slug:        model.text(),
  content:     model.text(),
  status:      model.enum(["draft", "published", "archived"]).default("draft"),
  meta_title:  model.text().nullable(),
  meta_desc:   model.text().nullable(),
 
})

export default Page