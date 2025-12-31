// AI-powered search service for intelligent product recommendations
import { Product } from '../types';
import { 
  getApprovedServiceProviders, 
  getServiceProvidersByCategory, 
  getServiceProvidersByArea 
} from "./firebase-service-providers"
import { 
  getAllActiveServices, 
  getServicesByCategory, 
  searchServices 
} from "./firebase-services"
import { ServiceProvider, Service, User } from "../types"

// Add Firebase imports
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./firebase"

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'query' | 'recommendation';
  confidence: number;
  data?: Product | string;
}

export interface SearchIntent {
  primaryIntent: 'find_product' | 'browse_category' | 'get_recommendations' | 'compare_products';
  entities: {
    products?: string[];
    categories?: string[];
    attributes?: string[];
    priceRange?: { min?: number; max?: number };
  };
  context: {
    urgency?: 'high' | 'medium' | 'low';
    occasion?: string;
    preferences?: string[];
  };
}

export class AISearchService {
  private products: Product[] = [];
  private searchHistory: string[] = [];
  private userPreferences: Map<string, string[]> = new Map();

  constructor(products: Product[]) {
    this.products = products;
  }

  // Update products data
  updateProducts(products: Product[]) {
    this.products = products;
  }

  // Analyze search query to understand user intent
  analyzeIntent(query: string): SearchIntent {
    const lowerQuery = query.toLowerCase();

    // Product name matching
    const productMatches = this.products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    );

    // Category matching
    const categoryMatches = this.getCategoriesFromQuery(lowerQuery);

    // Price indicators
    const priceRange = this.extractPriceRange(lowerQuery);

    // Context clues
    const urgency = this.detectUrgency(lowerQuery);
    const occasion = this.detectOccasion(lowerQuery);

    let primaryIntent: SearchIntent['primaryIntent'] = 'find_product';

    if (lowerQuery.includes('show me') || lowerQuery.includes('browse') || lowerQuery.includes('categories')) {
      primaryIntent = 'browse_category';
    } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      primaryIntent = 'get_recommendations';
    } else if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
      primaryIntent = 'compare_products';
    }

    return {
      primaryIntent,
      entities: {
        products: productMatches.slice(0, 3).map(p => p.name),
        categories: categoryMatches,
        priceRange,
      },
      context: {
        urgency,
        occasion,
      }
    };
  }

  // Generate intelligent search suggestions
  generateSuggestions(query: string, limit: number = 8): SearchSuggestion[] {
    console.log('AI Search Service - generateSuggestions called with:', query);
    console.log('AI Search Service - available products:', this.products.length);

    if (!query.trim()) return [];

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Product name suggestions
    const productMatches = this.products
      .filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => {
        // Prioritize exact matches and popular products
        const aExact = a.name.toLowerCase().startsWith(lowerQuery);
        const bExact = b.name.toLowerCase().startsWith(lowerQuery);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by rating and popularity
        const aScore = (a.rating || 0) + (a.popularity || 0);
        const bScore = (b.rating || 0) + (b.popularity || 0);
        return bScore - aScore;
      })
      .slice(0, 4);

    productMatches.forEach(product => {
      suggestions.push({
        text: product.name,
        type: 'product',
        confidence: this.calculateConfidence(query, product),
        data: product
      });
    });

    // Category suggestions
    const categories = this.extractCategoriesFromQuery(query);
    categories.forEach(category => {
      suggestions.push({
        text: `Browse ${category}`,
        type: 'category',
        confidence: 0.8,
        data: category
      });
    });

    // Smart query suggestions based on context
    const smartQueries = this.generateSmartQueries(query);
    smartQueries.forEach(smartQuery => {
      suggestions.push({
        text: smartQuery,
        type: 'query',
        confidence: 0.7
      });
    });

    // Recommendations based on search patterns
    if (query.length > 2) {
      const recommendations = this.generateRecommendations(query);
      recommendations.forEach(rec => {
        suggestions.push({
          text: rec,
          type: 'recommendation',
          confidence: 0.6
        });
      });
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  // Get related products for a search query
  getRelatedProducts(query: string, currentProduct?: Product, limit: number = 4): Product[] {
    const intent = this.analyzeIntent(query);

    let candidates = [...this.products];

    // Filter out current product if provided
    if (currentProduct) {
      candidates = candidates.filter(p => p.id !== currentProduct.id);
    }

    // Score products based on relevance
    const scoredProducts = candidates.map(product => ({
      product,
      score: this.calculateProductScore(product, intent, query)
    }));

    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }

  // Search with AI-powered filtering and ranking
  searchProducts(query: string, filters?: any): Product[] {
    if (!query.trim()) return [];

    const intent = this.analyzeIntent(query);
    let results = [...this.products];

    // Apply intent-based filtering
    if (intent.entities.categories?.length) {
      results = results.filter(product =>
        intent.entities.categories!.some(category =>
          product.category.toLowerCase().includes(category.toLowerCase()) ||
          product.displayCategory?.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply price range filtering
    if (intent.entities.priceRange) {
      const { min, max } = intent.entities.priceRange;
      results = results.filter(product => {
        const price = product.discount
          ? product.price * (1 - product.discount / 100)
          : product.price;
        if (min && price < min) return false;
        if (max && price > max) return true;
        return true;
      });
    }

    // Score and rank results
    const scoredResults = results.map(product => ({
      product,
      score: this.calculateProductScore(product, intent, query)
    }));

    return scoredResults
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
  }

  // Learn from user behavior
  recordSearchInteraction(query: string, selectedProduct?: Product, clickedSuggestion?: SearchSuggestion) {
    this.searchHistory.unshift(query);

    // Keep only recent searches
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(0, 100);
    }

    // Update user preferences based on interactions
    if (selectedProduct) {
      this.updateUserPreferences(query, selectedProduct);
    }
  }

  // Get trending searches
  getTrendingSearches(): string[] {
    const recentSearches = this.searchHistory.slice(0, 50);
    const searchCounts = new Map<string, number>();

    recentSearches.forEach(search => {
      const count = searchCounts.get(search) || 0;
      searchCounts.set(search, count + 1);
    });

    return Array.from(searchCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([search]) => search);
  }

  private calculateConfidence(query: string, product: Product): number {
    const lowerQuery = query.toLowerCase();
    const lowerName = product.name.toLowerCase();
    const lowerDesc = product.description.toLowerCase();

    let confidence = 0;

    // Exact name match gets highest score
    if (lowerName === lowerQuery) confidence += 1.0;
    // Name starts with query
    else if (lowerName.startsWith(lowerQuery)) confidence += 0.8;
    // Name contains query
    else if (lowerName.includes(lowerQuery)) confidence += 0.6;
    // Description contains query
    else if (lowerDesc.includes(lowerQuery)) confidence += 0.4;

    // Boost for popular/high-rated products
    if (product.rating && product.rating >= 4.5) confidence += 0.1;
    if (product.popularity && product.popularity > 50) confidence += 0.1;
    if (product.featured) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private calculateProductScore(product: Product, intent: SearchIntent, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    // Text relevance
    if (product.name.toLowerCase().includes(lowerQuery)) score += 0.3;
    if (product.description.toLowerCase().includes(lowerQuery)) score += 0.2;

    // Category relevance
    if (intent.entities.categories?.some(cat =>
      product.category.toLowerCase().includes(cat.toLowerCase())
    )) score += 0.2;

    // Price relevance
    if (intent.entities.priceRange) {
      const { min, max } = intent.entities.priceRange;
      const price = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;

      if (min && price >= min) score += 0.1;
      if (max && price <= max) score += 0.1;
    }

    // Product quality indicators
    if (product.rating && product.rating >= 4) score += 0.1;
    if (product.featured) score += 0.1;
    if (product.inStock) score += 0.1;

    return score;
  }

  private getCategoriesFromQuery(query: string): string[] {
    const categories = [
      'drinks', 'beverages', 'food', 'snacks', 'beverages', 'water', 'juice',
      'electronics', 'phones', 'computers', 'accessories',
      'fashion', 'clothing', 'shoes', 'accessories',
      'home', 'furniture', 'appliances', 'decor',
      'beauty', 'cosmetics', 'skincare', 'haircare',
      'sports', 'fitness', 'outdoors', 'equipment'
    ];

    return categories.filter(cat => query.includes(cat));
  }

  private extractCategoriesFromQuery(query: string): string[] {
    // This would ideally use NLP to extract categories
    // For now, using simple keyword matching
    const categoryKeywords = {
      'beverages': ['drink', 'beverage', 'juice', 'soda', 'water'],
      'food': ['food', 'snack', 'eat', 'meal'],
      'electronics': ['phone', 'computer', 'laptop', 'gadget', 'tech'],
      'fashion': ['clothing', 'fashion', 'wear', 'outfit'],
      'home': ['home', 'house', 'furniture', 'decor']
    };

    const foundCategories: string[] = [];

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        foundCategories.push(category);
      }
    });

    return foundCategories;
  }

  private extractPriceRange(query: string): { min?: number; max?: number } {
    const pricePatterns = [
      { pattern: /(\d+)\s*-\s*(\d+)/, min: 1, max: 2 },
      { pattern: /under\s*(\d+)/i, max: 1 },
      { pattern: /below\s*(\d+)/i, max: 1 },
      { pattern: /over\s*(\d+)/i, min: 1 },
      { pattern: /above\s*(\d+)/i, min: 1 },
      { pattern: /less\s*than\s*(\d+)/i, max: 1 },
      { pattern: /more\s*than\s*(\d+)/i, min: 1 }
    ];

    for (const { pattern, min: minIndex, max: maxIndex } of pricePatterns) {
      const match = query.match(pattern);
      if (match) {
        const range: { min?: number; max?: number } = {};
        if (minIndex) range.min = parseInt(match[minIndex]);
        if (maxIndex) range.max = parseInt(match[maxIndex]);
        return range;
      }
    }

    return {};
  }

  private detectUrgency(query: string): 'high' | 'medium' | 'low' {
    const urgentKeywords = ['urgent', 'asap', 'quickly', 'emergency', 'now', 'immediately'];
    const mediumKeywords = ['soon', 'today', 'tonight', 'weekend'];

    if (urgentKeywords.some(word => query.includes(word))) return 'high';
    if (mediumKeywords.some(word => query.includes(word))) return 'medium';
    return 'low';
  }

  private detectOccasion(query: string): string | undefined {
    const occasions = {
      'party': ['party', 'celebration', 'birthday', 'event'],
      'workout': ['gym', 'exercise', 'workout', 'fitness'],
      'travel': ['travel', 'trip', 'vacation', 'journey'],
      'gift': ['gift', 'present', 'surprise', 'someone'],
      'cooking': ['cook', 'recipe', 'meal', 'dinner']
    };

    for (const [occasion, keywords] of Object.entries(occasions)) {
      if (keywords.some(word => query.includes(word))) {
        return occasion;
      }
    }

    return undefined;
  }

  private generateSmartQueries(query: string): string[] {
    const queries: string[] = [];

    // Add related searches
    if (query.includes('phone')) {
      queries.push('smartphone accessories', 'phone cases', 'screen protectors');
    }
    if (query.includes('laptop')) {
      queries.push('laptop bags', 'laptop stands', 'external hard drives');
    }
    if (query.includes('shoes')) {
      queries.push('shoe care', 'socks', 'shoe racks');
    }

    return queries.slice(0, 3);
  }

  private generateRecommendations(query: string): string[] {
    const recommendations: string[] = [];

    // Context-based recommendations
    if (query.includes('cold') || query.includes('flu')) {
      recommendations.push('Vitamin C supplements', 'Herbal tea', 'Tissues');
    }
    if (query.includes('workout') || query.includes('gym')) {
      recommendations.push('Protein shakes', 'Energy bars', 'Water bottles');
    }
    if (query.includes('party')) {
      recommendations.push('Disposable cups', 'Snacks', 'Party decorations');
    }

    return recommendations;
  }

  private updateUserPreferences(query: string, product: Product) {
    const preferences = this.userPreferences.get(query) || [];
    preferences.push(product.category);
    this.userPreferences.set(query, preferences.slice(-5)); // Keep last 5
  }
}

  // Singleton instance
  let aiSearchService: AISearchService | null = null;

  export const getAISearchService = (products: Product[]): AISearchService => {
    if (!aiSearchService) {
      aiSearchService = new AISearchService(products);
    } else {
      // Update products through a public method
      aiSearchService.updateProducts(products);
    }
    return aiSearchService;
  };

// Add user profile integration
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...(userDoc.data() as any)
      } as User
    }
    return null
  } catch (error) {
    console.warn("⚠️ AI Search: Failed to fetch user profile:", error)
    return null
  }
}

// Add booking integration
export const createBooking = async (bookingData: any): Promise<string | null> => {
  try {
    const bookingRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "pending"
    })
    
    return bookingRef.id
  } catch (error) {
    console.error("💥 AI Search: Failed to create booking:", error)
    return null
  }
}

// Add offline cache support
class OfflineCache {
  private static instance: OfflineCache
  private cache: Map<string, { data: any, timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): OfflineCache {
    if (!OfflineCache.instance) {
      OfflineCache.instance = new OfflineCache()
    }
    return OfflineCache.instance
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string): any {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  clear(): void {
    this.cache.clear()
  }
}

// Enhanced network status monitoring
export const checkNetworkStatus = (): boolean => {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine
  }
  return true // Assume online in server environments
}

// Enhanced AI search function that fetches real data from Firebase
export const searchRealServices = async (query: string, context?: any, userId?: string): Promise<{
  providers: ServiceProvider[],
  services: Service[],
  suggestions: string[],
  userProfile?: User | null,
  isOnline: boolean
}> => {
  try {
    console.log("🔍 AI Search: Searching for services with query:", query)
    
    // Check network status
    const isOnline = checkNetworkStatus()
    
    // Initialize results
    let providers: ServiceProvider[] = []
    let services: Service[] = []
    let userProfile: User | null = null
    const suggestions: string[] = []
    
    // Get user profile if userId provided
    if (userId && isOnline) {
      userProfile = await getUserProfile(userId)
    }
    
    // Normalize query for better matching
    const normalizedQuery = query.toLowerCase().trim()
    
    // Try to get from cache first if offline or for common queries
    const cache = OfflineCache.getInstance()
    const cacheKey = `search_${normalizedQuery}`
    
    if (!isOnline || normalizedQuery.length === 0) {
      const cachedResult = cache.get(cacheKey)
      if (cachedResult) {
        console.log("✅ AI Search: Using cached results")
        return {
          ...cachedResult,
          isOnline
        }
      }
    }
    
    // Search for services based on query
    if (normalizedQuery.length > 0 && isOnline) {
      // Try to find services by search term
      try {
        services = await searchServices(normalizedQuery)
        console.log("✅ AI Search: Found services by search term:", services.length)
      } catch (error) {
        console.warn("⚠️ AI Search: Service search failed, using all active services:", error)
        services = await getAllActiveServices()
      }
      
      // If no services found, try category-based search
      if (services.length === 0) {
        const categories = [
          "plumbing", "electrical", "cleaning", "repairs", 
          "beauty", "tutoring", "event-planning", "catering",
          "fitness", "landscaping", "photography", "other"
        ]
        
        for (const category of categories) {
          if (normalizedQuery.includes(category)) {
            try {
              services = await getServicesByCategory(category)
              console.log("✅ AI Search: Found services by category:", category, services.length)
              break
            } catch (error) {
              console.warn("⚠️ AI Search: Category search failed for:", category, error)
            }
          }
        }
      }
      
      // Search for providers based on query
      try {
        providers = await getApprovedServiceProviders()
        console.log("✅ AI Search: Found approved providers:", providers.length)
        
        // Filter providers by query if needed
        if (normalizedQuery.length > 0) {
          providers = providers.filter(provider => 
            provider.name?.toLowerCase().includes(normalizedQuery) ||
            provider.description?.toLowerCase().includes(normalizedQuery) ||
            provider.category?.toLowerCase().includes(normalizedQuery) ||
            provider.serviceAreas?.some(area => area.toLowerCase().includes(normalizedQuery))
          )
          console.log("✅ AI Search: Filtered providers by query:", providers.length)
        }
      } catch (error) {
        console.warn("⚠️ AI Search: Provider search failed:", error)
        providers = []
      }
    } else if (!isOnline) {
      // Provide offline fallback
      console.log("⚠️ AI Search: Offline mode - providing limited results")
      services = [] // Empty for now, could provide cached popular services
      providers = [] // Empty for now, could provide cached popular providers
    } else {
      // If no query, get all active services and approved providers
      try {
        services = await getAllActiveServices()
        providers = await getApprovedServiceProviders()
        console.log("✅ AI Search: Loaded all active services and providers")
      } catch (error) {
        console.error("💥 AI Search: Failed to load services/providers:", error)
      }
    }
    
    // Generate smart suggestions based on results
    if (services.length > 0) {
      // Get unique categories from services
      const categories = [...new Set(services.map(s => s.category).filter(Boolean))] as string[]
      categories.slice(0, 3).forEach(cat => {
        suggestions.push(`Find ${cat} services`, `Best ${cat} providers`)
      })
    }
    
    if (providers.length > 0) {
      // Get unique service areas from providers
      const areas = [...new Set(providers.flatMap(p => p.serviceAreas || []))] as string[]
      areas.slice(0, 2).forEach(area => {
        suggestions.push(`Find providers in ${area}`, `Top rated in ${area}`)
      })
      
      // Add top-rated providers suggestions
      const topRated = providers
        .filter(p => p.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 2);
      
      topRated.forEach(provider => {
        suggestions.push(`Book ${provider.name}`, `Highly rated provider`)
      })
    }
    
    // Add personalized suggestions based on user profile
    if (userProfile && userProfile.addresses && userProfile.addresses.length > 0) {
      const userCity = userProfile.addresses[0].city
      if (userCity) {
        suggestions.push(`Find services in ${userCity}`, `Providers near ${userCity}`)
      }
    }
    
    // Add general suggestions if needed
    if (suggestions.length < 4) {
      suggestions.push(
        "Find service providers",
        "Check service pricing",
        "Book appointment",
        "Emergency service",
        "Top rated providers",
        "24/7 support"
      )
    }
    
    // Add some universal helpful suggestions
    suggestions.push("How it works", "Safety guarantee", "Payment methods")
    
    // Limit to 8 suggestions for more variety
    const finalSuggestions = [...new Set(suggestions)].slice(0, 8)
    
    const result = {
      providers: providers.slice(0, 10), // Limit to 10 providers
      services: services.slice(0, 10),   // Limit to 10 services
      suggestions: finalSuggestions,
      userProfile,
      isOnline
    }
    
    // Cache the results
    if (isOnline) {
      cache.set(cacheKey, result)
    }
    
    console.log("✅ AI Search: Completed with results:", {
      providers: providers.length,
      services: services.length,
      suggestions: finalSuggestions,
      isOnline
    })
    
    return result
    
  } catch (error) {
    console.error("💥 AI Search: Fatal error:", error)
    
    // Return empty results with default suggestions
    return {
      providers: [],
      services: [],
      suggestions: [
        "Find service providers",
        "Check service pricing",
        "Book appointment",
        "Emergency service",
        "Top rated providers",
        "24/7 support",
        "How it works",
        "Safety guarantee"
      ],
      isOnline: checkNetworkStatus()
    }
  }
}

