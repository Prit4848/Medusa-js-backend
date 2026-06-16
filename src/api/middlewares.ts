import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/cms/media",
      method: "POST",
      middlewares: [
        upload.array("files"),
      ],
    },
    {
      matcher: "/store/feedback",  
      method: "POST",
      middlewares: [upload.array("files")],
    },
  ],
})
