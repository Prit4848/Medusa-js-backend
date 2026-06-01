import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Container, Heading, Input, Label, Textarea } from "@medusajs/ui"

export default function CmsBlogFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    author: "",
    thumbnail: "",
    tags: "",
    status: "draft",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetch(`/admin/cms/blogs/${id}`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) =>
          setForm({
            ...data.blog,
            tags: (data.blog.tags || []).join(", "),
          })
        )
    }
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handleSave = async () => {
    setSaving(true)
    const url = isNew ? "/admin/cms/blogs" : `/admin/cms/blogs/${id}`
    const method = isNew ? "POST" : "PUT"

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    })

    if (res.ok) {
      navigate("/cms-blogs")
    } else {
      alert("Failed to save blog")
    }
    setSaving(false)
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{isNew ? "New Blog" : "Edit Blog"}</Heading>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/cms-blogs")}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-3xl">
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

        <div>
          <Label>Content</Label>
          <Textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Write your blog content here..."
            rows={12}
          />
        </div>
      </div>
    </Container>
  )
}