import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react"

interface EditProductProps {
  params: {
    id: string
  }
}

export default function EditProduct({ params }: EditProductProps) {
  const { id } = params
  const navigate = useNavigate()

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/admin/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Product (Simplified)</h1>
          <p className="text-gray-500 mt-2">Editing product with ID: {id}</p>
        </div>

        <div>
          <p>This is a simplified version of the Edit Product page for testing purposes.</p>
        </div>
      </div>
    </div>
  )
}