import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Button, Container, Heading, Input, Label,
  Select, Textarea,
} from "@medusajs/ui"

export default function CmsPageFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    status: "draft",
    meta_title: "",
    meta_desc: "",
  })
  const [saving, setSaving] = useState(false)

  // Load existing page if editing
  useEffect(() => {
    if (!isNew) {
      fetch(`/admin/cms/pages/${id}`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setForm(data.page))
    }
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    // Auto-generate slug from title
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

  const handleSave = async () => {
    setSaving(true)
    const url = isNew ? "/admin/cms/pages" : `/admin/cms/pages/${id}`
    const method = isNew ? "POST" : "PUT"

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      navigate("/cms-pages")
    } else {
      alert("Failed to save page")
    }
    setSaving(false)
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{isNew ? "New Page" : "Edit Page"}</Heading>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/cms-pages")}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-3xl">
        {/* Title */}
        <div>
          <Label>Title</Label>
          <Input name="title" value={form.title} onChange={handleChange} placeholder="About Us" />
        </div>

        {/* Slug */}
        <div>
          <Label>Slug</Label>
          <Input name="slug" value={form.slug} onChange={handleChange} placeholder="about-us" />
        </div>

        {/* Status */}
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
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Content */}
        <div>
          <Label>Content</Label>
          <Textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Page content..."
            rows={10}
          />
        </div>

        {/* SEO */}
        <Heading level="h2" className="mt-4">SEO</Heading>
        <div>
          <Label>Meta Title</Label>
          <Input name="meta_title" value={form.meta_title} onChange={handleChange} />
        </div>
        <div>
          <Label>Meta Description</Label>
          <Textarea name="meta_desc" value={form.meta_desc} onChange={handleChange} rows={3} />
        </div>
      </div>
    </Container>
  )
}