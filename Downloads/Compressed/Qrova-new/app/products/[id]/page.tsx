"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProductDetailPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the shop page
    router.replace('/shop')
  }, [router])
  
  return null
}
