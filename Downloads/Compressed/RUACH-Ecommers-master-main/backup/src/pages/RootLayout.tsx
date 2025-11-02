import React from 'react'
import { Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

export default function RootLayout() {
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col">
        <Outlet />
      </div>
    </HelmetProvider>
  )
}
