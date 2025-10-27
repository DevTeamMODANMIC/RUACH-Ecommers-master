export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions (FAQs)</h1>
      {/* GENERAL */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">General</h2>
        <details className="mb-4 border rounded p-4" open>
          <summary className="cursor-pointer font-medium">What is Ruach E-Store?</summary>
          <p className="mt-2 text-gray-600">Ruach E-Store is an online marketplace where different vendors sell a wide range of products, giving customers variety, quality, and competitive prices in one place.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How do I create an account?</summary>
          <p className="mt-2 text-gray-600">Click on the **Register** button at the top-right corner of the homepage and fill in the required information.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">Do I need an account to shop?</summary>
          <p className="mt-2 text-gray-600">You can browse products without an account, but you’ll need to sign up or log in to place an order.</p>
        </details>
      </section>

      {/* ORDERS & PAYMENT */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Orders & Payment</h2>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How do I place an order on Ruach E-Store?</summary>
          <p className="mt-2 text-gray-600">Simply add items to your cart, proceed to checkout, select your preferred payment method, and confirm your order.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">What payment methods are accepted?</summary>
          <p className="mt-2 text-gray-600">We accept debit/credit cards, bank transfers, mobile money, and cash on delivery (where available).</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">Can I order from multiple vendors at once?</summary>
          <p className="mt-2 text-gray-600">Yes, you can add items from different vendors to your cart. However, they may be delivered separately depending on the vendors.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How do I track my order?</summary>
          <p className="mt-2 text-gray-600">Log in to your Ruach E-Store account and go to “My Orders” to track your order status in real-time.</p>
        </details>
      </section>

      {/* SHIPPING & DELIVERY */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Shipping & Delivery</h2>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How long does delivery take?</summary>
          <p className="mt-2 text-gray-600">Delivery times vary depending on the vendor and your location. Estimated delivery times will be shown at checkout.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">Can I choose my delivery method?</summary>
          <p className="mt-2 text-gray-600">Yes, options like home delivery, pickup stations, or express delivery are available depending on the vendor.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">Are shipping fees the same for all vendors on Ruach E-Store?</summary>
          <p className="mt-2 text-gray-600">No, shipping fees depend on each vendor’s shipping policy and your delivery location.</p>
        </details>
      </section>

      {/* RETURNS & REFUNDS */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Returns & Refunds</h2>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">Can I return an item purchased from Ruach E-Store?</summary>
          <p className="mt-2 text-gray-600">Yes, returns are accepted within [X] days if the product is defective, wrong, or not as described. Please check each vendor’s return policy.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How do I request a refund?</summary>
          <p className="mt-2 text-gray-600">Go to “My Orders,” select the product, and click “Request Return/Refund.” Our team will guide you through the process.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How long does it take to receive my refund?</summary>
          <p className="mt-2 text-gray-600">Refunds are processed within [X] business days after the returned item has been received and verified.</p>
        </details>
      </section>

      {/* VENDOR INFORMATION */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Vendor Information</h2>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">Who are the vendors on Ruach E-Store?</summary>
          <p className="mt-2 text-gray-600">Our vendors are verified sellers ranging from small businesses to established brands. Each vendor manages their own inventory, pricing, and shipping.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How do I contact a vendor on Ruach E-Store?</summary>
          <p className="mt-2 text-gray-600">You can send a message directly from the product page or through your order details.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How do I become a vendor on Ruach E-Store?</summary>
          <p className="mt-2 text-gray-600">Visit our “Sell With Us” page, fill out the vendor application form, and our team will get in touch with you.</p>
        </details>
      </section>

      {/* CUSTOMER SUPPORT */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Customer Support</h2>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">How do I contact Ruach E-Store customer support?</summary>
          <p className="mt-2 text-gray-600">You can reach us via live chat, email at support@ruachestore.com.ng, or call our helpline at [phone number].</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">What if I receive a fake or counterfeit item?</summary>
          <p className="mt-2 text-gray-600">We have strict anti-counterfeit policies. Report the item immediately, and we will investigate, process a refund, and take action against the vendor.</p>
        </details>
        <details className="mb-4 border rounded p-4">
          <summary className="cursor-pointer font-medium">Is shopping on Ruach E-Store safe?</summary>
          <p className="mt-2 text-gray-600">Yes, we use secure payment gateways, encrypted data protection, and vendor verification to ensure safe shopping.</p>
        </details>
      </section>
    </div>
  )
}