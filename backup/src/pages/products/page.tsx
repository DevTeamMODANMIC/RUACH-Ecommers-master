"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function ProductsPage() {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to the shop page
    navigate('/shop', { replace: true })
  }, [navigate])
  
  return null
}
