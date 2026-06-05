import { model } from "@medusajs/framework/utils"

const Blog = model.define("blog", {
  id:          model.id().primaryKey(),
  title:       model.text(),
  slug:        model.text(),
  content:     model.text(),
  content_html: model.text().nullable(),
  content_json: model.json().nullable(),
  author:      model.text(),
  thumbnail:   model.text().nullable(),
  tags:        model.array().nullable(),
  status:      model.enum(["draft", "published"]).default("draft"),
  published_at: model.dateTime().nullable(),
 
})

export default Blog