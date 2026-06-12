import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Button, Table, Badge, Container, Heading, usePrompt } from "@medusajs/ui"
import { useNavigate } from "react-router-dom"

export const config = defineRouteConfig({
  label: "CMS Pages",
  icon: DocumentText,
})

export default function CmsPagesListPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const prompt = usePrompt()

  useEffect(() => {
    fetch("/admin/cms/pages", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages || [])
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: string) => {
    const interactive = await prompt({
      title: "Delete Page",
      description: "Are you sure you want to delete this page? This action cannot be undone.",
      variant: "danger",
    })

    if (!interactive) {
      return
    }

    await fetch(`/admin/cms/pages/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setPages((prev) => prev.filter((p: any) => p.id !== id))
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">CMS Pages</Heading>
        <Button onClick={() => navigate("/cms-pages/new")}>
          + New Page
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Slug</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pages.map((page: any) => (
              <Table.Row key={page.id}>
                <Table.Cell>{page.title}</Table.Cell>
                <Table.Cell>/{page.slug}</Table.Cell>
                <Table.Cell>
                  <Badge
                    color={page.status === "published" ? "green" : "grey"}
                  >
                    {page.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => navigate(`/cms-pages/${page.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(page.id)}
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