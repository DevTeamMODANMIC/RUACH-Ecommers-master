import { Loader2 } from "lucide-react"

export default function PaymentSuccessfulLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Processing your payment</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we confirm your payment details...
        </p>
      </div>
    </div>
  )
} 