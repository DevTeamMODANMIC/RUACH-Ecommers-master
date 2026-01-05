import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import ServiceProvidersShowcase from "../components/service-providers-showcase"
import Footer from "../components/footer"
import { searchRealServices } from "../lib/ai-search"
import {
  Search,
  Star,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Award,
  Shield,
  ThumbsUp,
  Filter,
  TrendingUp,
  Award as AwardIcon,
  Calendar,
  DollarSign,
  ChevronDown
} from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Service Providers"
  },
  {
    icon: Star,
    value: "4.8",
    label: "Average Rating"
  },
  {
    icon: CheckCircle,
    value: "10K+",
    label: "Services Completed"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Verified Providers"
  }
]

const SERVICE_CATEGORIES = [
  { id: "all", name: "All Services", count: "500+" },
  { id: "plumbing", name: "Plumbing", count: "45" },
  { id: "electrical", name: "Electrical", count: "38" },
  { id: "cleaning", name: "Cleaning", count: "62" },
  { id: "repair", name: "Home Repair", count: "89" },
  { id: "beauty", name: "Beauty & Wellness", count: "34" },
  { id: "tutoring", name: "Tutoring", count: "28" },
  { id: "delivery", name: "Delivery", count: "41" }
] as const

const TRUST_INDICATORS = [
  { icon: Award, label: "Verified Professionals", value: "100%", color: "text-yellow-600" },
  { icon: Shield, label: "Background Checked", value: "98%", color: "text-green-600" },
  { icon: ThumbsUp, label: "Customer Satisfaction", value: "4.8★", color: "text-blue-600" },
  { icon: Clock, label: "Avg Response Time", value: "< 2hrs", color: "text-purple-600" }
] as const

const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Find Providers",
    description: "Browse verified service providers in your area and compare their profiles and ratings",
    icon: Search,
    color: "bg-blue-600"
  },
  {
    step: "2",
    title: "Check Reviews",
    description: "Read authentic reviews from previous customers to make an informed decision",
    icon: Star,
    color: "bg-green-600"
  },
  {
    step: "3",
    title: "Contact & Book",
    description: "Contact providers directly or browse their services to book what you need",
    icon: MessageCircle,
    color: "bg-purple-600"
  },
  {
    step: "4",
    title: "Enjoy Great Service",
    description: "Relax while certified professionals handle your request with guaranteed satisfaction",
    icon: CheckCircle,
    color: "bg-slate-600"
  }
] as const

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: "🤖 Hello! I'm your intelligent service assistant, powered by advanced AI. I have access to our complete database of 500+ verified service providers across Nigeria. \n\nI can help you find the perfect professional for any service need - from emergency repairs to scheduled maintenance. \n\n**How can I assist you today?** You can ask me to:\n• Find specific service providers (plumbers, electricians, cleaners, etc.)\n• Check pricing for services\n• Book appointments\n• Find providers in your area\n• Get emergency service contacts\n\nJust tell me what you need!",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState({
    askedForService: false,
    askedForLocation: false,
    askedForTimeframe: false,
    currentService: null,
    currentLocation: null,
    bookingIntent: false,
    emergencyIntent: false
  });
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const navigate = useNavigate();

  // Monitor network status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Add offline message to chat when connection is lost
  useEffect(() => {
    if (!isOnline) {
      const offlineMessage = {
        id: chatMessages.length + 1,
        type: "bot",
        message: "⚠️ You're currently offline. I can still help with general questions, but I won't be able to access real-time data until you're back online.",
        timestamp: new Date()
      };
      
      // Check if we haven't already added this message
      if (!chatMessages.some(msg => msg.message.includes("You're currently offline"))) {
        setChatMessages(prev => [...prev, offlineMessage]);
      }
    }
  }, [isOnline, chatMessages]);

  // Smart suggestions based on conversation context
  const generateSmartSuggestions = (lastUserMessage: string, botResponse: string) => {
    const suggestions: string[] = [];
    
    // Service-related suggestions
    if (lastUserMessage.includes('plumbing') || lastUserMessage.includes('pipe') || lastUserMessage.includes('leak')) {
      suggestions.push("Find plumbers near me", "Emergency plumbing service", "Get plumbing quote", "24/7 plumber hotline");
    } else if (lastUserMessage.includes('electrical') || lastUserMessage.includes('electric') || lastUserMessage.includes('wiring')) {
      suggestions.push("Find electricians", "Emergency electrical repair", "Generator installation", "Electrical safety check");
    } else if (lastUserMessage.includes('cleaning')) {
      suggestions.push("Book cleaning service", "Office cleaning quote", "Move-in cleaning", "Deep cleaning special");
    } else if (lastUserMessage.includes('repair')) {
      suggestions.push("Find repair specialists", "Get repair quote", "Emergency repair service", "Appliance repair");
    } else if (lastUserMessage.includes('beauty') || lastUserMessage.includes('spa') || lastUserMessage.includes('hair')) {
      suggestions.push("Find beauty services", "Book spa appointment", "Hair stylist near me", "Manicure & pedicure");
    } else if (lastUserMessage.includes('tutor') || lastUserMessage.includes('lesson')) {
      suggestions.push("Find tutors", "Book lesson", "Math tutor near me", "Online tutoring");
    } else if (lastUserMessage.includes('delivery') || lastUserMessage.includes('courier')) {
      suggestions.push("Find delivery services", "Same-day delivery", "Package shipping", "Express courier");
    } else if (lastUserMessage.includes('catering') || lastUserMessage.includes('event')) {
      suggestions.push("Find caterers", "Event planning", "Wedding catering", "Corporate events");
    } else if (lastUserMessage.includes('fitness') || lastUserMessage.includes('gym')) {
      suggestions.push("Personal trainer", "Gym membership", "Fitness coaching", "Nutritionist");
    }
    
    // Location-based suggestions
    if (lastUserMessage.includes('lagos') || lastUserMessage.includes('abuja') || lastUserMessage.includes('portharcourt')) {
      const city = lastUserMessage.match(/(lagos|abuja|portharcourt)/i)?.[0] || '';
      suggestions.push(`Find providers in ${city}`, "Compare providers", `Best rated in ${city}`, `Near me in ${city}`);
    }
    
    // Time-based suggestions
    if (lastUserMessage.includes('today') || lastUserMessage.includes('now') || lastUserMessage.includes('urgent')) {
      suggestions.push("Emergency service", "Book for today", "Urgent help needed", "ASAP appointment");
    } else if (lastUserMessage.includes('tomorrow')) {
      suggestions.push("Book for tomorrow", "Check morning slots", "Morning appointment", "Evening service");
    } else if (lastUserMessage.includes('weekend')) {
      suggestions.push("Weekend service", "Book weekend appointment", "Saturday service", "Sunday availability");
    }
    
    // Price-related suggestions
    if (lastUserMessage.includes('price') || lastUserMessage.includes('cost') || lastUserMessage.includes('fee') || lastUserMessage.includes('rate')) {
      suggestions.push("Get detailed quote", "Compare pricing", "Budget options", "Premium services");
    }
    
    // Emergency-related suggestions
    if (lastUserMessage.includes('emergency') || lastUserMessage.includes('urgent') || lastUserMessage.includes('asap') || lastUserMessage.includes('now')) {
      suggestions.push("Call emergency service", "Get emergency contact", "24/7 helpline", "Immediate assistance");
    }
    
    // Booking-related suggestions
    if (lastUserMessage.includes('book') || lastUserMessage.includes('appointment') || lastUserMessage.includes('schedule')) {
      suggestions.push("Book now", "Check availability", "Reschedule booking", "Cancel appointment");
    }
    
    // Review-related suggestions
    if (lastUserMessage.includes('review') || lastUserMessage.includes('rating') || lastUserMessage.includes('feedback')) {
      suggestions.push("Leave a review", "Check provider ratings", "Top rated providers", "Verified reviews");
    }
    
    // Add suggestions based on user preferences (would come from user profile in real app)
    // For now, we'll simulate this by tracking conversation history
    const userPreferences = chatHistory
      .filter(msg => msg.type === 'user')
      .map(msg => msg.message.toLowerCase());
    
    if (userPreferences.some(pref => pref.includes('beauty') || pref.includes('spa') || pref.includes('hair'))) {
      suggestions.push("Find beauty services", "Book spa appointment", "Special offers", "Loyalty program");
    }
    
    if (userPreferences.some(pref => pref.includes('tutor') || pref.includes('lesson'))) {
      suggestions.push("Find tutors", "Book lesson", "Study packages", "Progress tracking");
    }
    
    // General suggestions for new users or when no context is available
    if (suggestions.length === 0) {
      suggestions.push(
        "Find plumbers", 
        "Emergency service", 
        "Book cleaning", 
        "Check pricing",
        "Top rated providers",
        "24/7 support",
        "Special offers",
        "Verified professionals"
      );
    }
    
    // Add some universal helpful suggestions
    suggestions.push("How it works", "Safety guarantee", "Payment methods");
    
    // Remove duplicates and limit to 6 suggestions for more variety
    return [...new Set(suggestions)].slice(0, 6);
  };

  // Chat handling functions with Gemini AI integration
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage.toLowerCase();
    const newMessage = {
      id: chatMessages.length + 1,
      type: "user",
      message: chatMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatHistory(prev => [...prev, newMessage]);
    const currentMessage = chatMessage;
    setChatMessage("");
    setIsTyping(true);

    try {
      // Try to get real data first for specific queries
      if (userMessage.includes('find') || userMessage.includes('search') || userMessage.includes('show me') || 
          userMessage.includes('plumber') || userMessage.includes('electrician') || userMessage.includes('cleaner') ||
          userMessage.includes('tutor') || userMessage.includes('beauty') || userMessage.includes('repair')) {
        // Get user ID if available (this would come from auth context in a real app)
        const userId = null; // In a real app, this would be from auth context
        const searchData = await searchRealServices(currentMessage, {}, userId);
        
        // If we found relevant data, use it to enhance the response
        if (searchData.providers.length > 0 || searchData.services.length > 0) {
          let enhancedResponse = "Great! I found some relevant services and providers for you:\n\n";
          
          if (searchData.services.length > 0) {
            enhancedResponse += "**Available Services:**\n";
            searchData.services.slice(0, 3).forEach((service, index) => {
              enhancedResponse += `${index + 1}. **${service.name}** - ${service.category}\n`;
              if (service.basePrice) {
                enhancedResponse += `   💰 Price: ₦${service.basePrice.toLocaleString()}\n`;
              }
              if (service.rating) {
                enhancedResponse += `   ⭐ Rating: ${service.rating}/5\n`;
              }
              if (service.duration) {
                enhancedResponse += `   🕐 Duration: ${service.duration} minutes\n`;
              }
            });
            enhancedResponse += "\n";
          }
          
          if (searchData.providers.length > 0) {
            enhancedResponse += "**Top Providers:**\n";
            searchData.providers.slice(0, 3).forEach((provider, index) => {
              enhancedResponse += `${index + 1}. **${provider.name}** - ⭐ ${provider.rating}/5 (${provider.reviewCount} reviews)\n`;
              if (provider.serviceAreas && provider.serviceAreas.length > 0) {
                enhancedResponse += `   📍 Service Areas: ${provider.serviceAreas.slice(0, 3).join(', ')}\n`;
              }
              if (provider.totalBookings) {
                enhancedResponse += `   📅 ${provider.totalBookings} bookings completed\n`;
              }
            });
          }
          
          // Add personalized suggestions if user profile available
          if (searchData.userProfile) {
            enhancedResponse += `\n👋 Welcome back, ${searchData.userProfile.name || 'customer'}! `;
            if (searchData.userProfile.addresses && searchData.userProfile.addresses.length > 0) {
              const city = searchData.userProfile.addresses[0].city;
              enhancedResponse += `I see you're in ${city}. I can find local providers for you.`;
            }
          }
          
          // Add call to action
          enhancedResponse += "\n\nWould you like to:\n• Get more details about a specific service?\n• Check availability for booking?\n• Compare providers?\n\nJust let me know how I can help!";
          
          const botMessage = {
            id: chatMessages.length + 2,
            type: "bot",
            message: enhancedResponse,
            timestamp: new Date()
          };

          setChatMessages(prev => [...prev, botMessage]);
          setChatHistory(prev => [...prev, botMessage]);
          
          // Use the suggestions from the search
          setSuggestedActions(searchData.suggestions.slice(0, 4));
          setIsTyping(false);
          return;
        }
      }

      // Try Gemini AI for more complex queries
      const aiResult: any = await getGeminiResponse(chatMessages, currentMessage);
      
      // Handle both string and object responses
      const aiResponse = typeof aiResult === 'string' ? aiResult : 
                        (aiResult.response ? aiResult.response : JSON.stringify(aiResult));

      const botMessage = {
        id: chatMessages.length + 2,
        type: "bot",
        message: aiResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
      setChatHistory(prev => [...prev, botMessage]);
      
      // Generate smart suggestions based on the conversation
      const suggestions = generateSmartSuggestions(userMessage, aiResponse);
      setSuggestedActions(suggestions);
    } catch (error) {
      console.error('Chat error:', error);

      // Fallback to intelligent rule-based responses
      setTimeout(() => {
        let botResponse = "";

        // Analyze user message for context
        if (userMessage.includes('price') || userMessage.includes('cost') || userMessage.includes('fee') || userMessage.includes('rate')) {
          botResponse = "Our service providers offer competitive pricing based on the scope of work. Most provide free quotes upfront! Could you tell me what specific service you need pricing for?";
        } else if (userMessage.includes('plumbing') || userMessage.includes('pipe') || userMessage.includes('leak') || userMessage.includes('faucet')) {
          botResponse = "I can help you find excellent plumbers! We have 45+ verified plumbing professionals. What specific plumbing service do you need? (leak repair, installation, maintenance, etc.)";
        } else if (userMessage.includes('electrical') || userMessage.includes('electric') || userMessage.includes('wiring') || userMessage.includes('outlet')) {
          botResponse = "Great choice! Our 38+ verified electricians are licensed and experienced. Are you looking for installations, repairs, or electrical maintenance?";
        } else if (userMessage.includes('cleaning') || userMessage.includes('maid') || userMessage.includes('housekeeping')) {
          botResponse = "We have 62+ professional cleaning services available! Whether you need deep cleaning, regular maintenance, or move-in/move-out cleaning, I can help. What's your specific need?";
        } else if (userMessage.includes('repair') || userMessage.includes('fix') || userMessage.includes('broken')) {
          botResponse = "Our 89+ repair specialists can handle various home repairs. What specifically needs to be repaired? (appliances, furniture, walls, etc.)";
        } else if (userMessage.includes('location') || userMessage.includes('area') || userMessage.includes('city') || userMessage.includes('where')) {
          botResponse = "We serve customers across Nigeria! We have verified providers in Lagos, Abuja, Port Harcourt, Kano, and many other cities. What's your location?";
        } else if (userMessage.includes('urgent') || userMessage.includes('emergency') || userMessage.includes('asap') || userMessage.includes('quick')) {
          botResponse = "I understand you need urgent service! We have emergency service providers available 24/7. What type of emergency service do you need and what's your location?";
        } else if (userMessage.includes('booking') || userMessage.includes('book') || userMessage.includes('schedule') || userMessage.includes('appointment')) {
          botResponse = "I'd be happy to help you book a service! Most providers offer flexible scheduling. What service would you like to book and when do you need it?";
        } else if (userMessage.includes('review') || userMessage.includes('rating') || userMessage.includes('testimonial') || userMessage.includes('feedback')) {
          botResponse = "Our providers maintain excellent ratings! We have over 10,000 completed services with an average 4.8-star rating. Would you like to see reviews for a specific service type?";
        } else if (userMessage.includes('verify') || userMessage.includes('background') || userMessage.includes('check') || userMessage.includes('trust')) {
          botResponse = "All our service providers undergo thorough verification including background checks, license validation, and reference verification. You can trust our 100% verified provider network!";
        } else if (userMessage.includes('guarantee') || userMessage.includes('warranty') || userMessage.includes('insurance')) {
          botResponse = "We offer comprehensive guarantees! All services include our quality assurance guarantee, and most providers offer their own warranties. Plus, we provide 24/7 customer support.";
        } else if (userMessage.includes('payment') || userMessage.includes('pay') || userMessage.includes('money')) {
          botResponse = "We offer secure payment options including card payments, bank transfers, and mobile money. Many providers also offer payment plans for larger jobs. What service are you interested in?";
        } else if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey') || userMessage.includes('good')) {
          botResponse = "Hello! Welcome to our service provider platform. I'm here to help you find trusted professionals for any service you need. What can I assist you with today?";
        } else if (userMessage.includes('beauty') || userMessage.includes('spa') || userMessage.includes('salon') || userMessage.includes('hair')) {
          botResponse = "We have 34+ beauty and wellness professionals! From hair styling and makeup to spa treatments and wellness services. What beauty service are you looking for?";
        } else if (userMessage.includes('tutoring') || userMessage.includes('lesson') || userMessage.includes('teach') || userMessage.includes('education')) {
          botResponse = "Our 28+ qualified tutors offer personalized learning experiences! We cover all subjects and age groups. What subject or skill would you like tutoring for?";
        } else if (userMessage.includes('delivery') || userMessage.includes('courier') || userMessage.includes('shipping') || userMessage.includes('transport')) {
          botResponse = "We have 41+ reliable delivery and logistics providers! From same-day delivery to nationwide shipping. What do you need delivered and to where?";
        } else if (userMessage.includes('help') || userMessage.includes('support') || userMessage.includes('assist')) {
          botResponse = "I'm here to help! I can assist you with finding service providers, checking availability, getting quotes, understanding our guarantees, or answering any questions about our platform.";
        } else if (userMessage.includes('thank') || userMessage.includes('thanks')) {
          botResponse = "You're very welcome! I'm glad I could help. Feel free to ask if you need anything else. Would you like me to help you find a specific service provider?";
        } else if (userMessage.length < 10) {
          botResponse = "I want to make sure I understand your needs perfectly. Could you provide a bit more detail about what you're looking for?";
        } else {
          // Context-aware responses based on conversation history
          const lastBotMessage = [...chatMessages].reverse().find(msg => msg.type === 'bot');
          const conversationLength = chatMessages.filter(msg => msg.type === 'user').length;

          if (conversationLength > 3) {
            botResponse = "I see we've been chatting for a bit! Let me help you more efficiently. Could you please specify: what service you need, your location, and when you need it? I can then connect you with the perfect provider.";
          } else if (lastBotMessage && lastBotMessage.message.includes('location')) {
            botResponse = "Thank you for sharing your location! Now, what specific service are you looking for in your area?";
          } else if (lastBotMessage && lastBotMessage.message.includes('service')) {
            botResponse = "Perfect! Based on your needs, I can recommend the best providers. Would you like me to show you available options or do you have questions about pricing/availability?";
          } else if (userMessage.includes('lagos') || userMessage.includes('abuja') || userMessage.includes('portharcourt') || userMessage.includes('kano')) {
            botResponse = "Great! We have excellent coverage in that city. What specific service do you need? I can show you our top-rated providers in your area.";
          } else if (userMessage.includes('today') || userMessage.includes('tomorrow') || userMessage.includes('weekend') || userMessage.includes('morning') || userMessage.includes('afternoon')) {
            botResponse = "I understand your timeframe! We have providers available for urgent bookings. What's the service you need and your exact location?";
          } else {
            botResponse = "That's very helpful information! To give you the most accurate assistance, could you tell me: \n\n1) **What specific service you need** - For example: plumbing, electrical work, cleaning, tutoring, etc.\n2) **Your location** - City or area where you need the service\n3) **When you need the service** - Today, tomorrow, this weekend, specific date/time\n\nWith these details, I can connect you with the perfect provider who's available in your area!";
          }
        }

        const botMessage = {
          id: chatMessages.length + 2,
          type: "bot",
          message: botResponse,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, botMessage]);
        setChatHistory(prev => [...prev, botMessage]);
        
        // Generate smart suggestions based on the conversation
        const suggestions = generateSmartSuggestions(userMessage, botResponse);
        setSuggestedActions(suggestions);
      }, 1500 + Math.random() * 1000);
    }

    setIsTyping(false);
  };

  // Quick action handler
  const handleQuickAction = (action: string) => {
    setChatMessage(action);
    // Auto-send after a short delay to simulate user typing
    setTimeout(() => {
      handleSendMessage();
    }, 300);
  };

  // Handle booking requests
  const handleBookingRequest = async (serviceId: string, providerId: string, date: string, time: string) => {
    try {
      // In a real implementation, this would integrate with the booking system
      console.log("Booking request:", { serviceId, providerId, date, time });
      
      // For now, just add a message to the chat
      const bookingMessage = {
        id: chatMessages.length + 1,
        type: "bot",
        message: `I've noted your booking request for ${date} at ${time}. One of our representatives will contact you shortly to confirm the details.`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, bookingMessage]);
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage = {
        id: chatMessages.length + 1,
        type: "bot",
        message: "Sorry, I encountered an error processing your booking request. Please try again or contact our support team.",
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Enhanced Gemini AI integration function
  const getGeminiResponse = async (conversationHistory: any[], currentMessage: string) => {
    try {
      const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

      console.log('Gemini API Key:', GEMINI_API_KEY ? 'Configured' : 'Not configured');

      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
        console.warn('Gemini API key not configured, using fallback responses');
        throw new Error('Gemini API key not configured');
      }

      // Comprehensive Nigerian service platform knowledge base
      const systemPrompt = `You are an expert AI customer service assistant for "Ruach" - Nigeria's largest and most trusted service provider platform.

      COMPLETE PLATFORM DATABASE:
      - Total Verified Providers: 500+ professionals across Nigeria
      - Service Categories & Exact Provider Counts:
        * Plumbing Services: 45+ licensed plumbers
          - Leak repair and detection
          - Pipe installation and replacement
          - Bathroom fixture installation
          - Drainage and sewage systems
          - Emergency plumbing repairs
        * Electrical Services: 38+ certified electricians
          - Residential and commercial wiring
          - Electrical installations and repairs
          - Generator installation and maintenance
          - Electrical safety inspections
          - Smart home electrical systems
        * Cleaning Services: 62+ professional cleaners
          - Deep house cleaning
          - Regular maintenance cleaning
          - Move-in/move-out cleaning
          - Office and commercial cleaning
          - Post-construction cleanup
        * Home Repair Services: 89+ skilled technicians
          - Appliance repair (AC, fridge, washing machine)
          - Furniture repair and restoration
          - Wall and ceiling repairs
          - Door and window repairs
          - General home maintenance
        * Beauty & Wellness: 34+ certified specialists
          - Hair styling and treatment
          - Professional makeup services
          - Spa and massage therapy
          - Nail care and treatments
          - Wellness and relaxation services
        * Tutoring Services: 28+ qualified educators
          - Mathematics tutoring (all levels)
          - English and languages
          - Science subjects (Physics, Chemistry, Biology)
          - Exam preparation (WAEC, JAMB, etc.)
          - Skill development and hobbies
        * Delivery & Logistics: 41+ reliable providers
          - Same-day local delivery
          - Nationwide shipping
          - Express courier services
          - Specialized transport (fragile items)
          - Moving and relocation services

      NIGERIAN COVERAGE MAP:
      - Lagos: 200+ providers (Victoria Island, Ikeja, Surulere, Lekki, etc.)
      - Abuja: 80+ providers (Maitama, Wuse, Garki, Asokoro, etc.)
      - Port Harcourt: 60+ providers (GRA, Old GRA, Trans Amadi, etc.)
      - Kano: 40+ providers (City Center, Nassarawa, etc.)
      - Ibadan: 25+ providers
      - Benin City: 20+ providers
      - Enugu: 18+ providers
      - Kaduna: 15+ providers
      - Other cities: Expanding rapidly

      PRICING STRUCTURE:
      - Basic Services: ₦3,000 - ₦8,000 starting price
      - Standard Services: ₦8,000 - ₦25,000
      - Complex Services: ₦25,000 - ₦100,000+
      - Emergency Services: 20-50% premium (₦5,000 minimum call-out)
      - All providers offer FREE detailed quotes
      - Payment plans available for projects over ₦50,000
      - Secure payments: Cards, bank transfer, mobile money

      TRUST METRICS:
      - 100% provider verification process
      - Background checks and police clearance
      - License and certification validation
      - Reference verification from previous clients
      - Insurance coverage up to ₦5,000,000 per job
      - 4.8-star average rating from 10,000+ completed jobs
      - 98% customer satisfaction rate
      - 95% on-time arrival rate

      AI ASSISTANT CAPABILITIES:
      - Full conversation memory and context awareness
      - Nigerian English proficiency with local expressions
      - Service recommendation engine based on user needs
      - Location-based provider matching
      - Pricing estimation and quote guidance
      - Emergency service coordination
      - Booking assistance and scheduling
      - Trust and safety information
      - Payment and guarantee explanations
      - Smart suggestion generation for follow-up actions
      - Real-time data access from Firebase database
      - Dynamic service and provider information retrieval

      CONVERSATION EXPERTISE:
      - Understand complex service requirements
      - Ask intelligent follow-up questions
      - Provide specific provider recommendations with real data
      - Handle pricing negotiations and estimates using actual pricing
      - Coordinate emergency responses with available providers
      - Manage booking and scheduling requests with real-time availability
      - Explain trust and verification processes with actual metrics
      - Guide users through platform features with current information
      - Generate contextual smart suggestions based on real data

      REAL-TIME DATA ACCESS:
      You have access to real-time data from our Firebase database including:
      - Current service providers and their availability
      - Actual service pricing and offerings
      - Real provider ratings and reviews
      - Current booking statistics and popularity metrics
      - Service area coverage information
      - Provider qualifications and certifications
      
      When discussing services or providers, always reference real data from the database rather than generic information.
      
      SMART SUGGESTION GENERATION:
      Based on the conversation context, you should generate 3-6 smart suggestions that would be helpful for the user. These should be:
      1. Action-oriented (e.g., "Book appointment", "Get quote")
      2. Service-specific (e.g., "Find electricians in Lagos")
      3. Context-aware (based on what was discussed)
      4. Concise and clear (3-5 words each)
      5. Varied in type (mix of actions, services, locations, and general help)
      6. Relevant to the Nigerian market
      
      Examples of good suggestions:
      - "Find plumbers near me"
      - "Emergency electrical repair"
      - "Book cleaning service"
      - "Get detailed quote"
      - "Compare providers"
      - "Check availability"
      - "24/7 support"
      - "Safety guarantee"
      - "Special offers"
      - "How it works"
      
      Always provide a mix of:
      - Direct service suggestions (e.g., "Find electricians")
      - Action-oriented suggestions (e.g., "Book appointment")
      - Location-based suggestions (e.g., "Providers in Lagos")
      - Time-based suggestions (e.g., "Weekend service")
      - Emergency options (e.g., "Emergency service")
      - General help options (e.g., "How it works", "Safety guarantee")
      
      RESPONSE STRATEGY:
      1. Immediately acknowledge the user's specific request
      2. Provide relevant platform statistics and capabilities
      3. Ask 1-2 clarifying questions to understand needs fully
      4. Offer 2-3 specific actionable next steps
      5. Mention exact provider numbers and locations
      6. Guide toward booking or contact actions
      7. Maintain friendly, professional Nigerian tone
      8. End with clear call-to-action
      
      When asking for more information, always format your response clearly with:
      - Numbered or bulleted lists for easy reading
      - Bold formatting for important details
      - Specific examples to guide the user
      - Friendly, encouraging language
      
      For example:
      "To give you the most accurate assistance, could you tell me: 
      
      1) **What specific service you need** - For example: plumbing, electrical work, cleaning, tutoring, etc.
      2) **Your location** - City or area where you need the service
      3) **When you need the service** - Today, tomorrow, this weekend, specific date/time
      
      With these details, I can connect you with the perfect provider who's available in your area!"

      At the end of your response, please also generate 2-4 smart suggestions in the following format:
      SUGGESTIONS:
      - [Action-oriented suggestion 1]
      - [Service-specific suggestion 2]
      - [Context-aware suggestion 3]
      
      Examples:
      SUGGESTIONS:
      - Find plumbers near me
      - Emergency electrical repair
      - Book cleaning service
      - Get detailed quote

      9. Generate contextual smart suggestions for follow-up actions
      10. Access and reference real-time data from Firebase for accurate information
      11. Provide specific service and provider details with current metrics`;

      // Comprehensive conversation context
      const conversationText = conversationHistory
        .slice(-10) // Maximum context for better understanding
        .map((msg, index) => {
          const role = msg.type === 'user' ? 'Customer' : 'Assistant';
          const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
          return `${role} (${timestamp}): ${msg.message}`;
        })
        .join('\n\n');

      // Advanced prompt with detailed instructions
      const enhancedPrompt = `${systemPrompt}

FULL CONVERSATION HISTORY:
${conversationText}

CUSTOMER'S CURRENT MESSAGE: "${currentMessage}"

INTELLIGENT ANALYSIS REQUIRED:
- Analyze the customer's intent and urgency level
- Identify specific service requirements mentioned
- Note any location preferences or constraints
- Determine budget considerations if mentioned
- Assess if this is a new inquiry or follow-up question
- Consider previous conversation context for personalized response

RESPONSE REQUIREMENTS:
- Provide comprehensive, helpful response using platform data
- Reference specific provider numbers and Nigerian locations
- Ask relevant follow-up questions to gather complete requirements
- Suggest 2-3 specific, actionable next steps
- Use natural Nigerian English with appropriate local context
- Be conversational but professional
- Show expertise in service provider platform
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7, // Balanced for natural but focused responses
            topK: 40, // Good variety in responses
            topP: 0.8, // Focused but creative
            maxOutputTokens: 300, // More comprehensive responses
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error response:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Gemini API response received:', data);

      if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
        let aiResponse = data.candidates[0].content.parts[0].text.trim();

        // Enhanced response cleanup
        aiResponse = aiResponse.replace(/\*\*/g, ''); // Remove markdown bold
        aiResponse = aiResponse.replace(/^\d+\.\s*/gm, ''); // Remove numbered lists
        aiResponse = aiResponse.replace(/Assistant:\s*/i, ''); // Remove "Assistant:" prefix
        aiResponse = aiResponse.replace(/AI:\s*/i, ''); // Remove "AI:" prefix
        aiResponse = aiResponse.replace(/Bot:\s*/i, ''); // Remove "Bot:" prefix

        // Ensure response is substantial
        if (aiResponse.length < 20) {
          throw new Error('Response too short, using fallback');
        }

        console.log('AI Response generated:', aiResponse);
        return aiResponse;
      } else {
        console.error('Unexpected Gemini API response structure:', data);
        throw new Error('Invalid Gemini API response format');
      }
    } catch (error) {
      console.error('Gemini AI integration error:', error);
      throw error;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Popular service categories
  const serviceCategories = [
    { id: "all", name: "All Services", count: "500+" },
    { id: "plumbing", name: "Plumbing", count: "45" },
    { id: "electrical", name: "Electrical", count: "38" },
    { id: "cleaning", name: "Cleaning", count: "62" },
    { id: "repair", name: "Home Repair", count: "89" },
    { id: "beauty", name: "Beauty & Wellness", count: "34" },
    { id: "tutoring", name: "Tutoring", count: "28" },
    { id: "delivery", name: "Delivery", count: "41" }
  ];

  // Trust indicators for social proof
  const trustIndicators = [
    { icon: Award, label: "Verified Professionals", value: "100%", color: "text-yellow-600" },
    { icon: Shield, label: "Background Checked", value: "98%", color: "text-green-600" },
    { icon: ThumbsUp, label: "Customer Satisfaction", value: "4.8★", color: "text-blue-600" },
    { icon: Clock, label: "Avg Response Time", value: "< 2hrs", color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-16 md:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Trusted Service Providers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Connect with verified, professional service providers across Nigeria.
              Find experts you can trust for all your service needs.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-2xl p-2 mb-6">
              <div className="flex flex-col lg:flex-row gap-2">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Search for service providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 text-lg border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Location Input */}
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 pr-4 py-3 text-lg border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 border-white/30 text-white hover:bg-white/10 rounded-xl"
                >
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>

                {/* Search Button */}
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl w-full lg:w-auto"
                  onClick={() => {
                    // Navigate to marketplace with search parameters
                    const searchParams = new URLSearchParams();
                    if (searchTerm) searchParams.set('search', searchTerm);
                    if (location) searchParams.set('location', location);
                    navigate(`/services/marketplace?${searchParams.toString()}`);
                  }}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Providers
                </Button>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {serviceCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`rounded-full ${
                          selectedCategory === category.id
                            ? "bg-blue-600 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {category.name} ({category.count})
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap justify-center gap-2 text-white/80">
              <span className="text-sm">Popular:</span>
              {["Plumbing", "Electrical", "Cleaning", "Home Repair"].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="text-sm hover:text-white underline underline-offset-2"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Stats with Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {trustIndicators.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Testimonials for Trust & Social Proof */}
      <div className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust our verified service providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Sarah Johnson",
                location: "Lagos",
                service: "Home Cleaning",
                rating: 5,
                comment: "Outstanding service! The cleaning team was professional and thorough. My house has never looked better.",
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                location: "Abuja",
                service: "Electrical Repair",
                rating: 5,
                comment: "Fixed my electrical issues quickly and safely. Very knowledgeable and reasonably priced.",
                avatar: "MC"
              },
              {
                name: "Grace Okafor",
                location: "Port Harcourt",
                service: "Plumbing",
                rating: 5,
                comment: "Excellent service from start to finish. Arrived on time and solved the problem efficiently.",
                avatar: "GO"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {testimonial.service}
                  </Badge>
                  <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Service Providers Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Service Providers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with verified professionals who deliver exceptional service quality
            </p>
          </div>

          {/* Provider Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {serviceCategories.slice(1, 5).map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AwardIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{category.count} providers</p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-sm text-gray-500">(120+ reviews)</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Navigate to marketplace with category filter
                      navigate(`/services/marketplace?category=${category.id}`);
                    }}
                  >
                    View Providers
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <ServiceProvidersShowcase />

          {/* Enhanced Browse All Button with More Options */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services/marketplace">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Search className="mr-2 h-5 w-5" />
                  Browse All Services
                </Button>
              </Link>
              <Link to="/services/emergency">
                <Button size="lg" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <Clock className="mr-2 h-5 w-5" />
                  Emergency Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced How It Works with Interactive Elements */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Finding and booking trusted service providers is simple with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Find Providers",
                description: "Browse verified service providers in your area and compare their profiles and ratings",
                icon: Search,
                color: "bg-blue-600"
              },
              {
                step: "2",
                title: "Check Reviews",
                description: "Read authentic reviews from previous customers to make an informed decision",
                icon: Star,
                color: "bg-green-600"
              },
              {
                step: "3",
                title: "Contact & Book",
                description: "Contact providers directly or browse their services to book what you need",
                icon: MessageCircle,
                color: "bg-purple-600"
              },
              {
                step: "4",
                title: "Get Quality Service",
                description: "Enjoy professional service delivery from verified and trusted providers",
                icon: CheckCircle,
                color: "bg-orange-600"
              }
            ].map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                <CardContent className="p-8">
                  <div className={`rounded-full w-16 h-16 ${step.color} text-white font-bold text-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="rounded-full w-8 h-8 bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Service Guarantees Section for Enhanced Trust */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Service Guarantees</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We stand behind every service booking with comprehensive guarantees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Professionals",
                description: "All providers undergo thorough background checks and verification"
              },
              {
                icon: Award,
                title: "Quality Assurance",
                description: "Satisfaction guaranteed or we'll help you find a better provider"
              },
              {
                icon: Clock,
                title: "On-Time Service",
                description: "Providers arrive within the scheduled time window or service is free"
              },
              {
                icon: ThumbsUp,
                title: "24/7 Support",
                description: "Our customer service team is available round the clock to help"
              }
            ].map((guarantee, index) => (
              <div key={index} className="text-center group">
                <div className="rounded-full w-20 h-20 bg-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <guarantee.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{guarantee.title}</h3>
                <p className="text-gray-600 text-sm">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help Finding a Service?</h2>
              <p className="text-lg text-gray-600">
                Our support team is here to help you find the perfect service provider
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="rounded-full w-16 h-16 bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                  <p className="text-gray-600 mb-3">Speak directly with our team</p>
                  <p className="font-semibold text-blue-600">+2347054915173</p>
                  <p className="text-sm text-gray-500">Mon-Sat: 8AM - 8PM</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                  <p className="text-gray-600 mb-3">Get instant help online</p>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      console.log('Contact card chat button clicked');
                      setShowChat(true);
                    }}
                  >
                    Start Chat
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="rounded-full w-16 h-16 bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                  <p className="text-gray-600 mb-3">Send us your inquiry</p>
                  <p className="font-semibold text-purple-600">support@ruachestore.com.ng</p>
                  <p className="text-sm text-gray-500">Response within 4 hours</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Connect with Providers?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our verified service providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services/marketplace">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Search className="mr-2 h-5 w-5" />
                Browse Services
              </Button>
            </Link>
            <Link to="/vendor/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            console.log('Chat button clicked');
            setShowChat(true);
          }}
          className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
          size="lg"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Chat Header */}
            <div className="bg-green-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  🤖
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-sm text-green-100">
                    Powered by Gemini AI {isOnline ? '• Online' : '• Offline'} • Typically replies instantly
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 p-0"
              >
                ×
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Suggestions */}
            {suggestedActions.length > 0 && (
              <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {suggestedActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded-full border border-gray-300 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-4 bg-white border-t rounded-b-2xl">
              <div className="flex space-x-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-green-600 hover:bg-green-700 px-6"
                >
                  Send
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Be respectful and kind
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
