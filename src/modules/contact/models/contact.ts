import { model } from "@medusajs/framework/utils"

const Contact = model.define("contact", {
  id: model.id().primaryKey(),
  name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),
  message: model.text(),
  status: model.enum(["unread", "read", "replied"]).default("unread"),
})

export default Contact