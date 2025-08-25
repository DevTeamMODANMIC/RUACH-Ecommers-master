import { useEffect } from "react"
import { useRouter } from "react-router-dom"

export default function ProductsPage() {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to the shop page
    router.replace('/shop')
  }, [router])
  
  return null
}
