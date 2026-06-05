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
  .builder-wrapper .dashicons, .dashicons { 
    background-image: url(${blockIcon}) !important; 
  }
  .components-popover__fallback-container .components-button.block-editor-block-types-list__item:not(:disabled):hover .dashicons {
    background-image: url(${blockHoverIcon}) !important;
  }
`

export default function CmsBlogFormPage() {
  useEffect(() => {
    const styleId = "gutenberg-styles-injection"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.innerHTML = gutenbergStyles
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
    author: "",
    thumbnail: "",
    tags: "",
    status: "draft",
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
            author:       data.blog.author       || "",
            thumbnail:    data.blog.thumbnail    || "",
            tags:         (data.blog.tags || []).join(", "),
            status:       data.blog.status       || "draft",
            published_at: data.blog.published_at || null,
          })
        })
    }
  }, [id, isNew])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name === "title") {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: isNew
          ? value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
          : prev.slug,
      }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

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
          ...form,
          title:        title || form.title,
          content:      json,
          content_html: html,
          content_json: parsedJson,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
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

  // Top form Save button (saves metadata without touching editor content)
  // const handleSave = async () => {
  //   setSaving(true)
  //   const url    = isNew ? "/admin/cms/blogs" : `/admin/cms/blogs/${id}`
  //   const method = isNew ? "POST" : "PUT"

  //   try {
  //     const res = await fetch(url, {
  //       method,
  //       credentials: "include",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...form,
  //         tags: form.tags
  //           .split(",")
  //           .map((t) => t.trim())
  //           .filter(Boolean),
  //       }),
  //     })

  //     if (res.ok) {
  //       navigate("/cms-blogs")
  //     } else {
  //       alert(`Failed to save blog (Error ${res.status})`)
  //     }
  //   } catch (err) {
  //     console.error(err)
  //     alert("Failed to save blog")
  //   } finally {
  //     setSaving(false)
  //   }
  // }

  return (
    <Container>
      <style>{ICON_STYLES}</style>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{isNew ? "New Blog" : "Edit Blog"}</Heading>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/cms-blogs")}>
            Cancel
          </Button>
          {/* <Button onClick={handleSave} isLoading={saving}>
            Save
          </Button> */}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* All your existing form fields — unchanged */}
        <div>
          <Label>Title</Label>
          <Input name="title" value={form.title} onChange={handleChange} placeholder="My First Blog" />
        </div>
        <div>
          <Label>Slug</Label>
          <Input name="slug" value={form.slug} onChange={handleChange} placeholder="my-first-blog" />
        </div>
        <div>
          <Label>Author</Label>
          <Input name="author" value={form.author} onChange={handleChange} placeholder="John Doe" />
        </div>
        <div>
          <Label>Thumbnail URL</Label>
          <Input name="thumbnail" value={form.thumbnail} onChange={handleChange} placeholder="https://..." />
        </div>
        <div>
          <Label>Tags (comma separated)</Label>
          <Input name="tags" value={form.tags} onChange={handleChange} placeholder="news, update, product" />
        </div>
        <div>
          <Label>Status</Label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* CONTENT — replaced with gutenberg-block-kit */}
        <div>
          <Label>Content</Label>
          <div className="mt-2 border rounded-lg overflow-hidden gutenberg-editor-wrapper" style={{ minHeight: "800px" }}>
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