import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "The Health Benefits of African Superfoods",
    excerpt: "Discover the nutritional powerhouses that have been staples in African cuisine for centuries.",
    image: "https://images.unsplash.com/photo-1518732714860-b43d55a36fb3?auto=format&fit=crop&w=800&q=60",
    author: "Dr. Amara Johnson",
    date: "2024-01-15",
    category: "Health & Nutrition",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Traditional Cooking Methods: Preserving Authentic Flavors",
    excerpt: "Learn about time-honored cooking techniques that bring out the best in traditional ingredients.",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=60",
    author: "Chef Kwame Asante",
    date: "2024-01-12",
    category: "Cooking Tips",
    readTime: "7 min read",
  },
  {
    id: 3,
    title: "Spice Guide: Essential Seasonings for African Cuisine",
    excerpt: "A comprehensive guide to the spices that define the rich flavors of African cooking.",
    image: "https://images.unsplash.com/photo-1470697571711-31d8a9aad8e5?auto=format&fit=crop&w=800&q=60",
    author: "Fatima Al-Rashid",
    date: "2024-01-10",
    category: "Ingredients",
    readTime: "6 min read",
  },
]

export default function BlogPreview() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover recipes, cooking tips, and stories about the rich culinary traditions we celebrate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    width={400}
                    height={300}
                    unoptimized
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-green-600">{post.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 transition-colors">
                  <Link href={`/blog/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span>{post.readTime}</span>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/blog/${post.id}`}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">View All Posts</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
