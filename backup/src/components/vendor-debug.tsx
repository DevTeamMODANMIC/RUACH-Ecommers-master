import { useVendor } from "../hooks/use-vendor"
import { useAuth } from "./auth-provider"

export function VendorDebug() {
  const { user } = useAuth()
  const { isVendor, allStores, activeStore, loading, vendorOwner } = useVendor()

  if (!user) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Vendor Debug Info</h4>
      <div className="space-y-1">
        <div>User: {user.email}</div>
        <div>Is Vendor: {isVendor ? "✅" : "❌"}</div>
        <div>Loading: {loading ? "⏳" : "✅"}</div>
        <div>Stores: {allStores.length}</div>
        <div>Active Store: {activeStore?.shopName || "None"}</div>
        <div>Vendor Owner: {vendorOwner ? "✅" : "❌"}</div>
        <div className="mt-2 text-gray-300">
          {allStores.map(store => (
            <div key={store.id}>• {store.shopName}</div>
          ))}
        </div>
      </div>
    </div>
  )
}