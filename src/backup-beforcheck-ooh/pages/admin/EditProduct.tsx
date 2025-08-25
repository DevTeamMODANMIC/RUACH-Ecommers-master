import { useParams } from 'react-router-dom'

export default function EditProduct() {
  const { id } = useParams()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <p className="text-gray-600">Edit product with ID: {id}</p>
    </div>
  )
}