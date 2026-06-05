import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
} from "@medusajs/ui"

import BlockEditor from "../editor/BlockEditor"

export default function CmsBlogFormPage() {
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
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetch(`/admin/cms/blogs/${id}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) => {
          setForm({
            title: data.blog.title || "",
            slug: data.blog.slug || "",
            content: data.blog.content || "",
            content_html: data.blog.content_html || "",
            content_json: data.blog.content_json || null,
            author: data.blog.author || "",
            thumbnail: data.blog.thumbnail || "",
            tags: (data.blog.tags || []).join(", "),
            status: data.blog.status || "draft",
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
          ? value
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          : prev.slug,
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleEditorSave = (data: any) => {
    setForm((prev) => ({
      ...prev,
      content: data.content,
      content_html: data.contentHtml,
      content_json: data.contentJson,
    }))
  }

  const handleSave = async () => {
    setSaving(true)

    const url = isNew
      ? "/admin/cms/blogs"
      : `/admin/cms/blogs/${id}`

    const method = isNew ? "POST" : "PUT"

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (res.ok) {
        navigate("/cms-blogs")
      } else {
        alert("Failed to save blog")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save blog")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">
          {isNew ? "New Blog" : "Edit Blog"}
        </Heading>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate("/cms-blogs")}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} isLoading={saving}>
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label>Title</Label>
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="My First Blog"
          />
        </div>

        <div>
          <Label>Slug</Label>
          <Input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="my-first-blog"
          />
        </div>

        <div>
          <Label>Author</Label>
          <Input
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>

        <div>
          <Label>Thumbnail URL</Label>
          <Input
            name="thumbnail"
            value={form.thumbnail}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Tags (comma separated)</Label>
          <Input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="news, update, product"
          />
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

          <div
            className="mt-2 border rounded-lg overflow-hidden"
            style={{ minHeight: "800px" }}
          >
            <BlockEditor
              blogId={id}
              initialData={{
                content: form.content,
                content_json: form.content_json,
              }}
              onSave={handleEditorSave}
            />
          </div>
        </div>
      </div>
    </Container>
  )
}