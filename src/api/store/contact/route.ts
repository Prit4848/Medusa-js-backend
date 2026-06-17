import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MODULE } from "../../../modules/contact"
import ContactModuleService from "../../../modules/contact/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { name, email, phone, message } = req.body as {
    name: string
    email: string
    phone?: string
    message: string
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" })
  }

  const contactService: ContactModuleService = req.scope.resolve(CONTACT_MODULE)

  const contact = await contactService.createContacts({
    name,
    email,
    phone: phone || null,
    message,
  })

  return res.status(201).json({ contact })
}