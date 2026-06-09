import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
} from "@medusajs/ui"
import { XMark } from "@medusajs/icons"

// OLD: import BlockEditor from "../editor/BlockEditor"
// NEW:
import { BlockEditor } from "gutenberg-block-kit/editor"
// import "gutenberg-block-kit/styles" // Removed global import
import gutenbergStyles from "gutenberg-block-kit/styles?inline"

// Fix for broken library icon paths (library bug uses /src/images/...)
import blockIcon from "../editor/images/block.png"
import blockHoverIcon from "../editor/images/block-hover.png"

const ICON_STYLES = `
  .builder-wrapper .dashicons, .gutenberg-editor-wrapper .dashicons { 
    background-image: url(${blockIcon}) !important; 
  }
  .components-popover__fallback-container .components-button.block-editor-block-types-list__item:not(:disabled):hover .dashicons {
    background-image: url(${blockHoverIcon}) !important;
  }
  .builder-wrapper .editor-header {
    background: #fff !important;
  }
`

// Helper to scope CSS strings to a selector
const scopeCSS = (css: string, selector: string) => {
  return css.replace(/([^}{]+)(?=\{)/g, (match) => {
    return match
      .split(",")
      .map((s) => {
        const trimmed = s.trim()
        if (
          !trimmed || 
          trimmed.startsWith("@") || 
          trimmed.startsWith(":root") || 
          trimmed.startsWith("from") || 
          trimmed.startsWith("to") || 
          /\d+%/.test(trimmed)
        ) {
          return s
        }

        // List of classes that should NOT be scoped because they are rendered in portals (like Modals)
        const globalClasses = [
          ".components-modal",
          ".components-popover",
          ".components-tooltip",
          ".components-autocomplete",
          ".components-dropdown",
          ".components-menu-group",
          ".components-menu-item",
          ".components-notice",
          ".components-snackbar",
          ".rbb-media-modal",
          ".components-drop-zone"
        ]

        if (globalClasses.some(cls => trimmed.includes(cls))) {
          return s
        }

        // Don't double-prefix if already prefixed
        if (trimmed.startsWith(selector)) {
          return s
        }
        return `${selector} ${trimmed}`
      })
      .join(", ")
  })
}

export default function CmsBlogFormPage() {
  useEffect(() => {
    const styleId = "gutenberg-styles-injection"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      // Scope the global gutenbergStyles to only apply inside our wrapper
      style.innerHTML = scopeCSS(gutenbergStyles, ".gutenberg-editor-wrapper")
      document.head.appendChild(style)
    }
    return () => {
      const style = document.getElementById(styleId)
      if (style) style.remove()
    }
  }, [])

  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    content_html: "",
    content_json: null as any,
    published_at: null as string | null,
  })

  const [saving, setSaving] = useState(false)

  // Load existing blog — same as before
  useEffect(() => {
    if (!isNew) {
      fetch(`/admin/cms/blogs/${id}`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          setForm({
            title:        data.blog.title        || "",
            slug:         data.blog.slug         || "",
            content:      data.blog.content      || "",
            content_html: data.blog.content_html || "",
            content_json: data.blog.content_json || null,
            published_at: data.blog.published_at || null,
          })
        })
    }
  }, [id, isNew])

  // Called by BlockEditor when user clicks Save inside the editor
  const handleEditorSave = async ({ title, html, json }: any) => {
    const parsedJson = JSON.parse(json)
    
    // update form state with latest editor content
    setForm((prev) => ({
      ...prev,
      title:        title || prev.title,
      content:      json,
      content_html: html,
      content_json: parsedJson,
    }))

    // immediately persist to Medusa
    setSaving(true)
    const url    = isNew ? "/admin/cms/blogs" : `/admin/cms/blogs/${id}`
    const method = isNew ? "POST" : "PUT"

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:        title || form.title || "Untitled",
          content:      json,
          content_html: html,
          content_json: parsedJson,
          published_at: form.published_at || new Date().toISOString()
        }),
      })

      const saved = await res.json()

      if (res.ok) {
        if (isNew && saved.blog?.id) {
          navigate(`/cms-blogs/${saved.blog.id}`, { replace: true })
        } else if (saved.blog?.slug) {
          setForm(prev => ({ ...prev, slug: saved.blog.slug }))
        }
        // Removed: navigate(`/cms-blogs`) - we want to stay on the page in a builder
      } else {
        console.error("Save failed:", saved)
        alert(`Failed to save (Error ${res.status}). Please check if you are still logged in.`)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save. Network error or session expired.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="p-0 max-w-none">
      <style>{ICON_STYLES}</style>
      <div className="flex items-center justify-between px-8 py-6  border-b ">
        <Heading level="h1">{isNew ? "New Page" : "Edit Page"}</Heading>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => navigate("/cms-blogs")}
            className="flex items-center justify-center p-2"
          >
            <XMark />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* CONTENT — replaced with gutenberg-block-kit */}
        <div>
          <div className="border-t gutenberg-editor-wrapper" style={{ minHeight: "calc(100vh - 150px)" }}>
            <BlockEditor
              initialPageId={id}
              initialTitle={form.title}
              initialContent={form.content || form.content_html || ""}

              // Media library integration
              media={{
                perPage: 20,
                listImages: async ({ page, perPage, search }) => {
                  const res = await fetch(
                    `/admin/cms/media?page=${page}&perPage=${perPage}&q=${encodeURIComponent(search || "")}`,
                    { credentials: "include" }
                  );
                  return res.json();
                },
                uploadImage: async (file) => {
                  const body = new FormData();
                  // The middleware expects "files" field
                  body.append('files', file);
                  const res = await fetch('/admin/cms/media', { 
                    method: 'POST', 
                    body,
                    credentials: "include" 
                  });
                  return res.json();
                },
              }}

              // package calls this when user clicks Save inside the editor
              onSave={handleEditorSave}

              onViewSite={() => {
                const html = form.content_html
                if (!html) {
                  alert("Please save your changes first to generate a preview.")
                  return
                }

                const blob = new Blob([`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>${form.title || "Blog Preview"}</title>
                      <style>
                        /* Package Styles */
                        ${gutenbergStyles}
                        
                        /* Preview Layout Styles */
                        body { 
                          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                          max-width: 1200px; 
                          margin: 0 auto; 
                          padding: 40px 20px; 
                          line-height: 1.6;
                          color: #111;
                        }
                        .preview-header { 
                          border-bottom: 1px solid #eee; 
                          padding-bottom: 20px; 
                          margin-bottom: 40px; 
                        }
                        .preview-label {
                          background: #e7f5ff;
                          color: #1971c2;
                          padding: 4px 10px;
                          border-radius: 4px;
                          font-size: 12px;
                          font-weight: 600;
                          text-transform: uppercase;
                          letter-spacing: 0.05em;
                          margin-bottom: 12px;
                          display: inline-block;
                        }
                        .preview-content img { max-width: 100%; height: auto; border-radius: 8px; }
                      </style>
                    </head>
                    <body>
                      <div class="preview-content">
                        ${html}
                      </div>
                    </body>
                  </html>
                `], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                window.open(url, '_blank')
              }}

              // package calls this on mount to load existing content
              onLoad={async (pageId) => {
                if (!pageId || pageId === "new") return null
                const res = await fetch(`/admin/cms/blogs/${pageId}`, {
                  credentials: "include",
                })
                if (!res.ok) return null
                const data = await res.json()
                return {
                  id:    data.blog.id,
                  title: data.blog.title,
                  html:  data.blog.content_html,
                  json:  data.blog.content,
                }
              }}
            />
          </div>
        </div>
      </div>
    </Container>
  )
}
