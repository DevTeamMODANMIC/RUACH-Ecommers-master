"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

interface SliderItem {
  id: string
  title: string
  description: string
  image: string
  link: string
}

export default function ProductSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  const sliderItems: SliderItem[] = [
    {
      id: "slide1",
      title: "African Beverages Collection",
      description: "Discover authentic drinks from across Africa - Fanta, Coca-Cola, and traditional beverages",
      image: "/product_images/coke-50cl-250x250.jpg",
      link: "/shop?category=beverages"
    },
    {
      id: "slide2",
      title: "Premium Rice & Grains",
      description: "High-quality Basmati rice and traditional grains for your authentic meals",
      image: "/product_images/Unnamed_Product_c4e3aaee.jpg",
      link: "/shop?category=rice"
    },
    {
      id: "slide3",
      title: "Authentic Spices & Seasonings",
      description: "Enhance your dishes with our premium collection of African spices and seasonings",
      image: "/product_images/Team-drink-250x250.jpg",
      link: "/shop?category=spices"
    }
  ]

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true)
    console.log('ProductSlider: Component mounted and rendered')
  }, [])
  
  // Navigation functions
  const nextSlide = () => {
    const next = (currentSlide + 1) % sliderItems.length
    console.log(`ProductSlider: Moving to slide ${next}`)
    setCurrentSlide(next)
  }

  const prevSlide = () => {
    const prev = (currentSlide - 1 + sliderItems.length) % sliderItems.length
    console.log(`ProductSlider: Moving to slide ${prev}`)
    setCurrentSlide(prev)
  }

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (!mounted) return
    
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    
    return () => clearInterval(timer)
  }, [mounted, currentSlide])
  
  if (!mounted) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft my-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-soft">
            <span>Featured Categories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 max-w-xl mx-auto text-base font-medium">
            Explore our carefully curated categories of authentic African and international products
          </p>
        </div>
        
        {/* Product Slider */}
        <div className="relative w-full h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-xl shadow-lg border-2 border-green-200">
          {/* Slides Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {sliderItems.map((item, index) => (
              <div key={item.id} className="min-w-full h-full relative bg-gradient-to-br from-green-100 to-green-200 flex">
                {/* Left Content */}
                <div className="w-1/2 flex items-center justify-center p-8 md:p-12 bg-gradient-to-r from-green-600 to-green-700">
                  <div className="text-left text-white max-w-lg">
                    <div className="inline-block px-4 py-2 bg-white/20 text-white text-sm rounded-full mb-4 shadow-lg backdrop-blur-sm">
                      Category {index + 1} of {sliderItems.length}
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 drop-shadow-lg leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-white/90 mb-6 text-base md:text-lg leading-relaxed drop-shadow-md">
                      {item.description}
                    </p>
                    <Button asChild size="lg" className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                      <Link href={item.link}>
                        Shop This Category <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {/* Right Image */}
                <div className="w-1/2 relative bg-white flex items-center justify-center p-8">
                  <div className="relative w-full h-full max-w-md max-h-md">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="50vw"
                      priority={index === 0}
                      onError={(e) => {
                        console.error(`Failed to load image: ${item.image}`)
                        const target = e.target as HTMLImageElement
                        target.src = "/product_images/unknown-product.jpg"
                        target.onerror = null
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-4 shadow-xl z-20 transition-all hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-4 shadow-xl z-20 transition-all hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Indicator dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {sliderItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 border-2 border-white/50 shadow-lg ${
                  currentSlide === index ? "bg-green-600 w-10 border-green-600" : "bg-white/70 hover:bg-white hover:scale-110"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Slide counter */}
        <div className="text-center mt-6">
          <span className="text-base font-medium text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
            {currentSlide + 1} of {sliderItems.length} categories
          </span>
        </div>
      </div>
    </section>
  )
}