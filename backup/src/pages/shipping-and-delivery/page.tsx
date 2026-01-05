import { Package, Rocket, Truck, MapPin, AlertTriangle, Shield } from 'lucide-react';

export default function ShippingAndDeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Shipping and Delivery</h1>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Package className="mr-3 text-green-600" /> Order Processing
          </h2>
          <p className="text-gray-700">
            All orders are processed within 1–2 business days after payment confirmation.
          </p>
          <p className="text-gray-700 mt-2">
            Orders placed on weekends or public holidays will be processed the next business day.
          </p>
          <p className="text-gray-700 mt-2">
            Pre-order or customized items may take longer, and estimated timelines will be stated on the product page.
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Rocket className="mr-3 text-green-600" /> Shipping Options & Delivery Times
          </h2>
          <p className="text-gray-700">
            We currently deliver nationwide across Nigeria and also offer international shipping.
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Standard Delivery (Nationwide Nigeria): 3–7 business days</li>
            <li>Express Delivery (Major Cities – Lagos, Abuja, Port Harcourt): 1–3 business days</li>
            <li>International Delivery: 7–15 business days (depending on destination & courier)</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Delivery times are estimates and may vary due to courier delays, public holidays, or unforeseen circumstances.
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Truck className="mr-3 text-green-600" /> Shipping Fees
          </h2>
          <p className="text-gray-700">
            Shipping fees are calculated at checkout based on your location and selected delivery option.
          </p>
          <p className="text-gray-700 mt-2">
            Free Nationwide Shipping on all orders above ₦50,000.
          </p>
          <p className="text-gray-700 mt-2">
            International shipping fees will be displayed at checkout before payment.
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-3 text-green-600" /> Tracking Your Order
          </h2>
          <p className="text-gray-700">
            Once your order is shipped, you will receive an email/SMS with your tracking number and courier details.
          </p>
          <p className="text-gray-700 mt-2">
            You can also track your order directly from your Ruach E-Store account dashboard.
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-3 text-green-600" /> Delivery Areas
          </h2>
          <p className="text-gray-700">
            We deliver to all 36 states in Nigeria.
          </p>
          <p className="text-gray-700 mt-2">
            International deliveries are available; please confirm shipping availability to your country at checkout.
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-3 text-yellow-500" /> Missed Deliveries & Re-Delivery
          </h2>
          <p className="text-gray-700">
            If you are not available to receive your package, the courier will attempt a re-delivery.
          </p>
          <p className="text-gray-700 mt-2">
            Additional charges may apply for multiple failed delivery attempts.
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-3 text-yellow-500" /> Delays & Exceptions
          </h2>
          <p className="text-gray-700">
            Deliveries may be delayed during peak shopping seasons, public holidays, or due to courier service disruptions.
          </p>
          <p className="text-gray-700 mt-2">
            Rural or hard-to-reach areas may require additional delivery time.
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Shield className="mr-3 text-green-600" /> Damaged, Lost, or Missing Packages
          </h2>
          <p className="text-gray-700">
            If your package is lost, delayed, or arrives damaged, please contact our support team within 48 hours of delivery attempt.
          </p>
          <p className="text-gray-700 mt-2">
            We will assist in resolving the issue with our courier partners or arrange for a replacement where applicable.
          </p>
        </div>
      </div>
    </div>
  );
}
