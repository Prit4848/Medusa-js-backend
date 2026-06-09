import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PencilSquare } from "@medusajs/icons"
import { Button, Table, Badge, Container, Heading } from "@medusajs/ui"
import { useNavigate } from "react-router-dom"

export const config = defineRouteConfig({
  label: "Block Builder",
  icon: PencilSquare,
})

export default function CmsBlogsListPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch("/admin/cms/blogs", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setBlogs(data.blogs || [])
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this?")) return
    await fetch(`/admin/cms/blogs/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setBlogs((prev) => prev.filter((b: any) => b.id !== id))
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Block Builder</Heading>
        <Button onClick={() => navigate("/cms-blogs/new")}>+ New Page</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Published At</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {blogs.map((blog: any) => (
              <Table.Row key={blog.id}>
                <Table.Cell>{blog.title}</Table.Cell>
                <Table.Cell>
                  {blog.published_at
                    ? new Date(blog.published_at).toLocaleDateString()
                    : "—"}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => navigate(`/cms-blogs/${blog.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(blog.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}