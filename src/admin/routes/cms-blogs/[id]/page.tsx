import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Toaster,
  toast,
} from "@medusajs/ui"
import { XMark } from "@medusajs/icons"

// OLD: import BlockEditor from "../editor/BlockEditor"
// NEW:
import { BlockEditor } from "gutenberg-block-kit/editor"
// import "gutenberg-block-kit/styles" // Removed global import
import gutenbergStyles from "gutenberg-block-kit/styles?inline"
import FrontendPage from "../components/FrontendPage"

// Fix for broken library icon paths (library bug uses /src/images/...)
import blockIcon from "../editor/images/block.png"
import blockHoverIcon from "../editor/images/block-hover.png"

const ICON_STYLES = `
  .builder-wrapper .dashicons, 
  .gutenberg-editor-wrapper .dashicons, 
  .components-modal .dashicons, 
  .rbb-media-modal .dashicons { 
    background-image: url(${blockIcon}) !important; 
  }
  .components-popover__fallback-container .components-button.block-editor-block-types-list__item:not(:disabled):hover .dashicons,
  .rbb-media-modal .components-button:hover .dashicons {
    background-image: url(${blockHoverIcon}) !important;
  }
  .builder-wrapper .editor-header {
    background: #fff !important;
  }
  /* Fix for media modal footer visibility */
  .rbb-media-modal .components-modal__content {
    display: flex;
    flex-direction: column;
    padding-bottom: 0 !important;
  }
  .rbb-media-modal__grid-wrap {
    flex: 1;
    overflow-y: auto;
  }
  .rbb-media-modal__footer {
    position: sticky;
    bottom: 0;
    background: #fff;
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
    margin: 0 -24px;
    z-index: 100;
  }
`

// Helper to scope CSS strings to a selector
const scopeCSS = (css: string, selector: string) => {
  return css.replace(/([^}{]+)(?=\{)/g, (match) => {
    // Split by comma but respect parentheses (e.g. :is(.a, .b))
    const parts: string[] = []
    let current = ""
    let depth = 0
    for (let i = 0; i < match.length; i++) {
      const char = match[i]
      if (char === "(") depth++
      if (char === ")") depth--
      if (char === "," && depth === 0) {
        parts.push(current)
        current = ""
      } else {
        current += char
      }
    }
    parts.push(current)

    return parts
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
          ".components-drop-zone",
          ".block-editor-media-placeholder",
          ".block-editor-media-replace-flow",
          ".components-form-token-field__suggestions-list"
        ]

        if (globalClasses.some(cls => trimmed.includes(cls))) {
          return s
        }

        // If it looks like a generic Gutenberg component, it might be used in a portal
        // so we don't scope it if it's already generic enough.
        // However, to be safe, we only do this for known portal-heavy prefixes.
        if (trimmed.includes(".components-") || trimmed.includes(".block-editor-")) {
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
  const [view, setView] = useState<"editor" | "site">("editor")

  useEffect(() => {
    const styleId = "gutenberg-styles-injection"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      // Scope the global gutenbergStyles to only apply inside our wrapper
      style.innerHTML = scopeCSS(gutenbergStyles, ".builder-wrapper")
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
    updated_at: null as string | null,
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
            updated_at:   data.blog.updated_at   || null,
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
        toast.success("Block saved successfully")
        if (isNew && saved.blog?.id) {
          navigate(`/cms-blogs/${saved.blog.id}`, { replace: true })
        } else if (saved.blog?.slug) {
          setForm(prev => ({ 
            ...prev, 
            slug: saved.blog.slug,
            updated_at: saved.blog.updated_at 
          }))
        }
        // Removed: navigate(`/cms-blogs`) - we want to stay on the page in a builder
      } else {
        console.error("Save failed:", saved)
        toast.error(`Failed to save (Error ${res.status}). Please check if you are still logged in.`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to save. Network error or session expired.")
    } finally {
      setSaving(false)
    }
  }

  if (view === "site") {
    return (
      <FrontendPage 
        title={form.title}
        html={form.content_html}
        json={form.content_json}
        updatedAt={form.updated_at || undefined}
        onBackToEditor={() => setView("editor")}
      />
    )
  }

  return (
    <Container className="p-0 max-w-none">
      <Toaster />
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
          <div className="border-t builder-wrapper" style={{ minHeight: "calc(100vh - 150px)" }}>
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
                  const data = await res.json();
                  return {
                    ...data,
                    images: data.items, // Ensure compatibility
                    count: data.total,  // Ensure compatibility
                  };
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
                if (!form.content_html) {
                  toast.warning("Please save your changes first to generate a preview.")
                  return
                }
                setView("site")
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
