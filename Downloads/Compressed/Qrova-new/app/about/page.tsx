import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "About Grova - Our Story & Mission",
  description: "Learn about Grova's journey, our commitment to authentic British and international foods, and our vision for bringing diverse flavors to your table.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center">About Grova</h1>
        
        <div className="relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] mb-6 sm:mb-8 rounded-lg overflow-hidden">
          <Image 
            src="/placeholder.svg?height=600&width=1200" 
            alt="Grova Store" 
            fill
            className="object-cover"
          />
        </div>
        
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Our Story</h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">
            Grova was founded with a simple mission: to be your everyday grocery shop for authentic British and international foods. What started as a small family business has grown into a thriving online marketplace connecting people with their cultural heritage through food.
          </p>
          <p className="mb-4 sm:mb-6 text-sm sm:text-base">
            Our founder recognized the challenge many people faced in finding authentic ingredients from their home countries. This personal experience inspired the creation of Grova, a place where everyone could access traditional ingredients and discover new flavors from diverse cultures.
          </p>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Our Mission</h2>
          <p className="mb-4 sm:mb-6 text-sm sm:text-base">
            At Grova, we believe food is a powerful connection to culture and community. Our mission is to make authentic international ingredients accessible, promote cultural exchange through culinary experiences, and support ethical food practices that respect both people and planet.
          </p>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Authenticity</h3>
                <p className="text-sm sm:text-base">We source genuine products directly from their regions of origin, ensuring you get the real flavors and quality you expect.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Community</h3>
                <p className="text-sm sm:text-base">We celebrate the diverse cultures represented in our products and actively support the communities that produce them.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Sustainability</h3>
                <p className="text-sm sm:text-base">We prioritize environmentally responsible practices throughout our supply chain, from sourcing to packaging.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Excellence</h3>
                <p className="text-sm sm:text-base">We strive for exceptional quality in our products and outstanding service for our customers.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Our Team</h2>
          <p className="mb-4 sm:mb-6 text-sm sm:text-base">
            Our dedicated team brings together expertise in food sourcing, quality control, and cultural knowledge. Many of our staff members have personal connections to the regions we source from, ensuring authentic selection and genuine cultural understanding.
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Contact Us</h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">
            Have questions about our products or want to learn more about Grova? We'd love to hear from you!
          </p>
          <p className="mb-2 text-sm sm:text-base"><strong>Email:</strong> info@grova.co.uk</p>
          <p className="mb-2 text-sm sm:text-base"><strong>Phone:</strong> +44 (0)20 1234 5678</p>
          <p className="mb-2 text-sm sm:text-base"><strong>Address:</strong> 123 High Street, London, UK</p>
        </div>
      </div>
    </div>
  )
}