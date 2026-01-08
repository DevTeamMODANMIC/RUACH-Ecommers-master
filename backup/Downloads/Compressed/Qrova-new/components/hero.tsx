"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Slides with proper product images
  const slides = [
    {
      id: 1,
      title: "GROVA",
      subtitle: "Elite Grocery Experience",
      description: "Discover authentic flavors, premium fresh produce, and international groceries delivered to your doorstep.",
      cta: "Shop Now",
      ctaLink: "/shop",
      bgColor: "bg-gradient-to-r from-green-800 to-emerald-900",
      image: "/a/coke-50cl-250x250.jpg"
    },
    {
      id: 2,
      title: "BEVERAGES",
      subtitle: "World-Class Drinks",
      description: "Explore our curated selection of international beverages, soft drinks, and traditional refreshments.",
      cta: "View Drinks",
      ctaLink: "/shop?category=beverages",
      bgColor: "bg-gradient-to-r from-green-800 to-emerald-900",
      image: "/a/Fanta-50cl-pack-150x150.png"
    },
    {
      id: 3,
      title: "FOODS",
      subtitle: "Heritage Ingredients",
      description: "Premium collection of authentic African foods, exotic spices, and traditional ingredients.",
      cta: "Shop Foods",
      ctaLink: "/shop?category=food",
      bgColor: "bg-gradient-to-r from-green-800 to-emerald-900",
      image: "/a/Lacasara-150x150.jpg"
    }
  ]

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-advance slides
  useEffect(() => {
    if (!isClient) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isClient, currentSlide, slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return (
      <div className="h-screen bg-gradient-to-r from-green-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="relative w-full h-screen bg-green-900 overflow-hidden">
      {/* Slides Container with Transform */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full h-full ${slide.bgColor}`}
          >
            <div className="container mx-auto px-6 h-full flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full py-12">
                {/* Left side - Text content */}
                <div className="text-white">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-light mb-6 text-white drop-shadow-md">
                    {slide.subtitle}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl mb-10 max-w-2xl leading-relaxed text-white drop-shadow-md">
                    {slide.description}
                  </p>
                  <Button asChild size="lg" className="bg-white text-green-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
                    <Link href={slide.ctaLink} className="flex items-center gap-2">
                      {slide.cta}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>

                {/* Right side - Product image */}
                <div className="flex items-center justify-center lg:justify-end">
                  <div className="relative w-full max-w-2xl lg:max-w-4xl h-[500px] lg:h-[700px] bg-blue-200 border-2 border-blue-400 rounded-3xl shadow-2xl p-8 lg:p-12 flex items-center justify-center">
                    {/* Test with a colored rectangle first */}
                    <div className="w-full h-full bg-gradient-to-br from-red-300 via-yellow-300 to-green-300 rounded-2xl flex items-center justify-center text-gray-700 font-bold text-2xl shadow-inner">
                      {slide.title} Image
                    </div>

                    {/* Then try to load actual image */}
                    <div className="absolute inset-0 w-full h-full opacity-100 p-2">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover rounded-2xl"
                        priority={slide.id === 1}
                        sizes="(max-width: 768px) 100vw, 60vw"
                        quality={100}
                        onError={(e) => {
                          console.error('Image failed to load:', slide.image);
                          // Hide the image if it fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all hover:scale-110 z-10"
        aria-label="Previous slide"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all hover:scale-110 z-10"
        aria-label="Next slide"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full transition-all hover:scale-125 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
