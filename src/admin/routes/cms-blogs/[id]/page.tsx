import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
} from "@medusajs/ui"

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
          title:        title || form.title || "Untitled Blog",
          content:      json,
          content_html: html,
          content_json: parsedJson,
          published_at: form.published_at || new Date().toISOString()
        }),
      })

      const saved = await res.json()

      if (res.ok) {
        navigate(`/cms-blogs`)
      } else {
        console.error("Save failed:", saved)
        alert(`Failed to save blog (Error ${res.status}). Please check if you are still logged in.`)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save blog. Network error or session expired.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container>
      <style>{ICON_STYLES}</style>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{isNew ? "New Blog" : "Edit Blog"}</Heading>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/cms-blogs")}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* CONTENT — replaced with gutenberg-block-kit */}
        <div>
          <div className="border rounded-lg overflow-hidden gutenberg-editor-wrapper" style={{ minHeight: "800px" }}>
            <BlockEditor
              initialPageId={id}
              initialTitle={form.title}
              initialContent={form.content || form.content_html || ""}

              // package calls this when user hits Save inside editor
              onSave={handleEditorSave}

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