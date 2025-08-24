// import { Metadata } from "next" // Commented out - not needed for React Router

// Metadata export removed for React Router compatibility
// export const metadata: Metadata = {
//   title: "Browse All Stores | RUACH-Ecommers",
//   description: "Discover authentic products from verified vendors across Nigeria and beyond. Browse our collection of trusted stores offering quality foods, spices, beverages, and more.",
//   keywords: "African stores, Nigerian vendors, authentic products, African food, spices, beverages, marketplace",
// }

export default function StoresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}