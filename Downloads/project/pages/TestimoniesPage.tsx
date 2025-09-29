import { ImageWithFallback } from '../components/figma/ImageWithFallback'
import { Star, Quote, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

interface TestimonyProps {
  name: string
  role: string
  image: string
  testimony: string
  rating: number
}

function TestimonyCard({ name, role, image, testimony, rating }: TestimonyProps) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
          <ImageWithFallback
            src={image}
            alt={`${name} profile`}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-gray-500">{role}</p>
          <div className="flex items-center mt-1">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
      </div>
      
      <Quote className="w-8 h-8 text-purple-300 mb-4" />
      <blockquote className="text-gray-600 leading-relaxed italic">
        "{testimony}"
      </blockquote>
    </div>
  )
}

export default function TestimoniesPage() {
  const testimonies = [
    {
      name: "Adunni Okonkwo",
      role: "Marriage Counselor",
      image: "https://images.unsplash.com/photo-1681597107753-58e48bb38c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4OTkzMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      testimony: "Understanding practical love has transformed not only my marriage but also how I guide couples in my practice. The principles here are life-changing and biblically sound.",
      rating: 5
    },
    {
      name: "James Adeleke",
      role: "Pastor & Community Leader",
      image: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU4OTkzMjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      testimony: "This approach to love has helped me serve my community better. When you truly understand love as described here, it becomes the foundation for all meaningful relationships.",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      role: "Young Professional",
      image: "https://images.unsplash.com/photo-1580640611343-3f53b12a5b1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMHRlc3RpbW9uaWFsfGVufDF8fHx8MTc1ODk5MzI0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      testimony: "I used to think love was just a feeling, but learning about practical love showed me it's a choice and an action. My relationships with family and friends have never been stronger.",
      rating: 5
    },
    {
      name: "Dr. Michael Okafor",
      role: "Relationship Coach",
      image: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU4OTkzMjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      testimony: "After 20 years of helping couples, I can confidently say that practical love principles are the most effective tools for building lasting, meaningful relationships.",
      rating: 5
    },
    {
      name: "Grace Emeka",
      role: "Mother & Educator",
      image: "https://images.unsplash.com/photo-1681597107753-58e48bb38c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4OTkzMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      testimony: "Teaching my children about practical love has given them tools for life. They understand that love is about serving others and being patient, kind, and forgiving.",
      rating: 5
    },
    {
      name: "Emmanuel Nkem",
      role: "Youth Leader",
      image: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU4OTkzMjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      testimony: "Working with young people, I see how transformative it is when they grasp what real love looks like. It changes how they treat each other and approach their futures.",
      rating: 5
    }
  ]

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-green-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-purple-800 mb-6">
            Testimonies
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from real people whose lives have been transformed by understanding and practicing true, practical love.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonies.map((testimony, index) => (
            <TestimonyCard
              key={index}
              name={testimony.name}
              role={testimony.role}
              image={testimony.image}
              testimony={testimony.testimony}
              rating={testimony.rating}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-purple-600 rounded-2xl p-12 text-white text-center">
          <Heart className="w-16 h-16 mx-auto mb-6 text-pink-300 fill-current" />
          <h3 className="text-3xl font-serif mb-4">Share Your Story</h3>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Have you experienced the power of practical love in your life? We'd love to hear your testimony and share it with others who need encouragement.
          </p>
          <Link to="/share-testimony" className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors inline-block">
            Share Your Testimony
          </Link>
        </div>
      </div>
    </section>
  )
}