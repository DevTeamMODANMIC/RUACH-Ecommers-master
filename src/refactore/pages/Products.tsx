import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function ProductsPage() {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to the shop page
    router.replace('/shop')
  }, [router])
  
  return null
}
