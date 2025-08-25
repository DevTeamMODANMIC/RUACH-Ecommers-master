import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Mail, ShoppingBag, ArrowRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  ctaLink: string;
}

// Updated slides with better images and content
const slides: Slide[] = [
  {
    id: 1,
    title: "Discover a World of Products",
    subtitle: "From fashion and electronics to handmade crafts, find it all on Ruach E-Store.",
    description: "Experience the tastes of home with our carefully curated selection of international Products.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    cta: "Shop Now",
    ctaLink: "/shop"
  },
  {
    id: 2,
    title: "Shop Local, Support Your Community",
    subtitle: "Discover unique products from independent vendors in your area.",
    description: "Quench your thirst with our wide range of international product and services",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
    cta: "View Collection",
    ctaLink: "/shop"
  },
  {
    id: 3,
    title: "Start Your Vendor Journey Today",
    subtitle: "Join our community of vendors and reach customers worldwide",
    description: "Manage up to 3 independent stores with our comprehensive vendor platform",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
    cta: "Become a Vendor",
    ctaLink: "/vendor/register"
  },
];

export default function Hero() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean[]>([true, true, true]);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  // Function to handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      // swipe left
      nextSlide();
    }
    
    if (isRightSwipe) {
      // swipe right
      prevSlide();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000); // Auto-advance every 7 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleImageLoad = (index: number) => {
    setIsLoading((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  };

  const scrollToNewsletter = () => {
    const newsletterSection = document.getElementById('newsletter-section');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform ease-out"
            onLoad={() => handleImageLoad(index)}
            style={{ 
              transform: index === currentSlide ? "scale(1.05)" : "scale(1)",
              transitionDuration: '15000ms'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center lg:items-start z-10">
            <div 
              className={`text-center lg:text-left max-w-5xl px-6 md:px-12 lg:px-16 transform transition-all duration-1000 ease-out ${
                index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <span className="inline-block px-4 py-1 bg-green-600 text-white text-xs md:text-sm rounded-full mb-4 shadow-lg">Premium Quality Guaranteed</span>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 drop-shadow-lg text-white">
                {slide.title}
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-white/90 drop-shadow-md max-w-2xl">
                {slide.subtitle}
              </p>
              
              <p className="hidden lg:block text-white/80 max-w-xl mb-6 text-lg">
                {slide.description}
              </p>
              
              <div className="flex flex-col md:flex-row items-center md:items-center justify-center lg:justify-start gap-3 md:gap-4 mt-6">
                <Button 
                  size="lg" 
                  onClick={() => navigate(slide.ctaLink)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 lg:px-10 py-6 md:py-7 text-sm md:text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-full group relative overflow-hidden w-full md:w-auto"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-500/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                  <ShoppingBag className="mr-2 h-4 md:h-5 w-4 md:w-5 group-hover:animate-bounce" />
                  {slide.cta}
                  <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={scrollToNewsletter}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/40 hover:border-white/50 px-6 md:px-8 lg:px-10 py-6 md:py-7 text-sm md:text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full group relative overflow-hidden w-full md:w-auto"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                  <Mail className="mr-2 h-4 md:h-5 w-4 md:w-5 group-hover:animate-pulse" />
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
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 h-10 w-10 md:h-12 md:w-12 rounded-full shadow-md backdrop-blur-sm bg-black/30 hidden md:flex"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
        <span className="sr-only">Previous</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 h-10 w-10 md:h-12 md:w-12 rounded-full shadow-md backdrop-blur-sm bg-black/30 hidden md:flex"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
        <span className="sr-only">Next</span>
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-[50]">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full transition-all duration-300 border-2 border-white/30 ${
              index === currentSlide 
                ? "bg-green-500 w-10 sm:w-10 border-green-400" 
                : "bg-white/50 hover:bg-white/80 hover:border-white/60"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}: ${slides[index].title}`}
          />
        ))}
      </div>
    </section>
  );
}