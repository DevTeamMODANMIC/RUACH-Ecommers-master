"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, User, Mail, ShoppingBag, ArrowRight } from "lucide-react"

// Updated slides with better images and content
const slides = [
  {
    id: 1,
    title: "Discover a World of Products",
    subtitle: "From fashion and electronics to handmade crafts, find it all on Ruach E-Store.",
    description: "Experience the tastes of home with our carefully curated selection of international groceries",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
    cta: "Shop Now",
    ctaLink: "/shop"
  },
  {
    id: 2,
    title: "Shop Local, Support Your Community",
    subtitle: "Discover unique products from independent vendors in your area.",
    description: "Quench your thirst with our wide range of international beverages and refreshments",
    image: "https://plus.unsplash.com/premium_photo-1661331827641-c6302f69d3f7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8RSUyMHZlbmRvcnxlbnwwfHwwfHx8MA%3D%3D",
    cta: "View Collection",
    ctaLink: "/shop"
  },
  {
    id: 3,
    title: "Start Selling on Ruach E-Store Today",
    subtitle: "Join our community of vendors and reach a wider audience.",
    description: "Get volume discounts on bulk purchases with our special wholesale options",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
    cta: "Become a Vendor",
    ctaLink: "/vendor/register"
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean[]>([true, true, true])
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Function to handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // swipe left
      nextSlide()
    }
    
    if (touchStart - touchEnd < -50) {
      // swipe right
      prevSlide()
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 7000) // Slightly longer duration for a more professional feel
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleImageLoad = (index: number) => {
    setIsLoading((prev) => {
      const newState = [...prev]
      newState[index] = false
      return newState
    })
  }

  const scrollToNewsletter = () => {
    const newsletterSection = document.getElementById('newsletter-section')
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section 
      className="relative h-[60vh] sm:h-[70vh] md:h-[85vh] overflow-hidden bg-white border-b border-gray-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Loading effect */}
          {isLoading[index] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            quality={90}
            priority={index === 0}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI2QTlcpAAAAABJRU5ErkJggg=="
            className="object-cover transition-transform duration-10000 ease-out"
            onLoad={() => handleImageLoad(index)}
            style={{ 
              transform: index === currentSlide ? "scale(1.05)" : "scale(1)",
              transitionDuration: '15000ms'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center md:items-start z-10">
            <div 
              className={`text-center md:text-left max-w-5xl px-6 md:px-16 transform transition-all duration-1000 ease-out ${
                index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <span className="inline-block px-4 py-1 bg-green-600 text-white text-xs md:text-sm rounded-full mb-4 shadow-lg">Limited Time Offers</span>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-4 drop-shadow-lg text-white">
                {slide.title}
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-white/90 drop-shadow-md max-w-2xl">
                {slide.subtitle}
              </p>
              
              <p className="hidden md:block text-white/80 max-w-xl mb-6 text-lg">
                {slide.description}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center justify-center md:justify-start gap-3 sm:gap-4 mt-6">
                <Button 
                  size="lg" 
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white px-8 sm:px-10 py-7 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-full group relative overflow-hidden"
                >
                  <Link href={slide.ctaLink}>
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-500/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                    <ShoppingBag className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                    {slide.cta}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={scrollToNewsletter}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/40 hover:border-white/50 px-8 sm:px-10 py-7 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                  <Mail className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Subscribe to Updates
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-md backdrop-blur-sm bg-black/30 hidden sm:flex"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        <span className="sr-only">Previous</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-md backdrop-blur-sm bg-black/30 hidden sm:flex"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
        <span className="sr-only">Next</span>
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-[50]">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-green-500 w-8 sm:w-10" 
                : "bg-white/50 hover:bg-white/80"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
