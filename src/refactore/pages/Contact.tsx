import ContactIntegration from "../components/contact-integration"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle,
  Headphones
} from "lucide-react"

const officeLocations = [
  {
    name: "Lagos Headquarters",
    address: "Plot 123, Victoria Island, Lagos, Nigeria",
    phone: "+234 816 066 2997",
    email: "lagos@ruachestore.com.ng",
    hours: "Mon-Fri: 8AM-8PM, Sat: 9AM-6PM"
  },
  {
    name: "Abuja Office", 
    address: "Suite 45, Central Business District, Abuja, Nigeria",
    phone: "+234 816 066 2997",
    email: "abuja@ruachestore.com.ng",
    hours: "Mon-Fri: 8AM-6PM, Sat: 10AM-4PM"
  }
]

const supportTypes = [
  {
    title: "Customer Support",
    description: "Help with orders, returns, account issues",
    icon: Headphones,
    email: "support@ruachestore.com.ng",
    response: "Within 4 hours"
  },
  {
    title: "Sales Inquiries",
    description: "Product questions, bulk orders, partnerships", 
    icon: MessageCircle,
    email: "sales@ruachestore.com.ng",
    response: "Within 24 hours"
  },
  {
    title: "Vendor Support",
    description: "Help for vendors and sellers on our platform",
    icon: Phone,
    email: "vendors@ruachestore.com.ng", 
    response: "Within 12 hours"
  }
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            We're here to help. Whether you have questions, need support, or want to explore 
            partnership opportunities, our team is ready to assist you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">&lt; 2 min</div>
              <div className="text-white/80">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-white/80">WhatsApp Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-white/80">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Contact Integration */}
      <div className="container mx-auto px-4 py-16">
        <ContactIntegration 
          title="Contact Our Team"
          description="Choose the best way to reach us based on your needs"
          showQuickContact={true}
          showContactForm={true}
          formType="general"
        />
      </div>

      {/* Support Types */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Specialized Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get targeted help from the right team for your specific needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportTypes.map((support, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <div className="rounded-full w-16 h-16 bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <support.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{support.title}</h3>
                <p className="text-gray-600 mb-4">{support.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600">{support.email}</p>
                  <p className="text-sm text-gray-500">Response: {support.response}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Office Locations */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Locations</h2>
            <p className="text-lg text-gray-600">Visit us at our offices across Nigeria</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {officeLocations.map((location, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  {location.name}
                </h3>
                
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                    <span className="text-sm">{location.address}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{location.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{location.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{location.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions before you contact us
              </p>
            </div>

            <div className="space-y-6">
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">What are your response times?</summary>
                <div className="mt-3 text-gray-600">
                  <p>We aim to respond to all inquiries within:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Phone calls: Immediate during business hours</li>
                    <li>WhatsApp: Within 30 minutes (24/7)</li>
                    <li>Email: Within 4-24 hours</li>
                    <li>Support tickets: Within 4 hours for urgent, 24 hours for standard</li>
                  </ul>
                </div>
              </details>

              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">How can I track my order?</summary>
                <div className="mt-3 text-gray-600">
                  <p>You can track your order by:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Logging into your account and checking "My Orders"</li>
                    <li>Using the tracking link sent to your email</li>
                    <li>Calling our customer support line</li>
                    <li>Using our WhatsApp bot for instant updates</li>
                  </ul>
                </div>
              </details>

              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">Do you offer bulk pricing?</summary>
                <div className="mt-3 text-gray-600">
                  <p>Yes! We offer competitive bulk pricing for:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Orders over ₦100,000 (5-15% discount)</li>
                    <li>Corporate purchases (custom pricing)</li>
                    <li>Reseller partnerships (special rates)</li>
                    <li>Event catering (volume discounts)</li>
                  </ul>
                  <p className="mt-2">Contact our sales team for a custom quote.</p>
                </div>
              </details>

              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">How do I become a vendor?</summary>
                <div className="mt-3 text-gray-600">
                  <p>Becoming a vendor is simple:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Visit our vendor registration page</li>
                    <li>Complete the application with business details</li>
                    <li>Submit required documents for verification</li>
                    <li>Wait for approval (usually 2-3 business days)</li>
                    <li>Set up your store and start selling!</li>
                  </ol>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}