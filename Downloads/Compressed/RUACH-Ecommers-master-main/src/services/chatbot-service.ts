import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ChatMessage {
  id?: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  pageContext?: string;
}

export interface ChatContext {
  page: string;
  userId?: string;
  userType?: 'customer' | 'vendor' | 'service-provider';
  language?: string;
}

export interface ApiKnowledgeBase {
  id: string;
  question: string;
  answer: string;
  category: string;
  pageContext?: string;
  userType?: string[];
}

class ChatbotService {
  private knowledgeBase: ApiKnowledgeBase[] = [];
  private isKnowledgeBaseLoaded = false;

  /**
   * Load knowledge base from Firebase Firestore
   */
  async loadKnowledgeBase(context?: ChatContext): Promise<void> {
    try {
      const q = query(
        collection(db, 'chatbot-knowledge'),
        orderBy('category'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      this.knowledgeBase = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ApiKnowledgeBase));
      
      this.isKnowledgeBaseLoaded = true;
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      // Fallback to basic knowledge if API fails
      this.loadFallbackKnowledge(context);
    }
  }

  /**
   * Load fallback knowledge when API is unavailable
   */
  private loadFallbackKnowledge(context?: ChatContext): void {
    const baseKnowledge: ApiKnowledgeBase[] = [
      {
        id: '1',
        question: 'order',
        answer: 'You can track your order by logging into your account and checking "My Orders", or using the tracking link sent to your email.',
        category: 'orders',
        userType: ['customer']
      },
      {
        id: '2',
        question: 'delivery',
        answer: 'We offer fast delivery within 24-48 hours in major cities. Delivery times may vary based on your location.',
        category: 'shipping',
        userType: ['customer']
      },
      {
        id: '3',
        question: 'return',
        answer: 'We have a 7-day return policy for most items. Please visit our Returns & Refunds page for detailed information.',
        category: 'returns',
        userType: ['customer']
      },
      {
        id: '4',
        question: 'product',
        answer: context?.userType === 'vendor' 
          ? 'To add products to your store, go to your Vendor Dashboard > Products > Add New Product.'
          : 'Browse thousands of authentic products from verified vendors in our marketplace.',
        category: 'products',
        userType: context?.userType ? [context.userType] : ['customer', 'vendor']
      }
    ];
    
    this.knowledgeBase = baseKnowledge;
    this.isKnowledgeBaseLoaded = true;
  }

  /**
   * Find relevant answers based on user input
   */
  async findRelevantAnswers(input: string, context?: ChatContext): Promise<string[]> {
    if (!this.isKnowledgeBaseLoaded) {
      await this.loadKnowledgeBase(context);
    }

    const lowerInput = input.toLowerCase();
    const relevantAnswers: string[] = [];

    // Filter knowledge base based on context
    let filteredKnowledge = this.knowledgeBase;
    
    if (context?.userType) {
      filteredKnowledge = filteredKnowledge.filter(kb => 
        !kb.userType || kb.userType.includes(context.userType!)
      );
    }
    
    if (context?.page) {
      filteredKnowledge = filteredKnowledge.filter(kb => 
        !kb.pageContext || kb.pageContext === context.page
      );
    }

    // Find exact matches
    for (const kb of filteredKnowledge) {
      if (lowerInput.includes(kb.question.toLowerCase())) {
        relevantAnswers.push(kb.answer);
      }
    }

    // If no exact matches, find partial matches
    if (relevantAnswers.length === 0) {
      for (const kb of filteredKnowledge) {
        const questionWords = kb.question.toLowerCase().split(' ');
        const inputWords = lowerInput.split(' ');
        
        const matchCount = questionWords.filter(word => 
          inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord))
        ).length;
        
        if (matchCount >= Math.min(questionWords.length, 2)) {
          relevantAnswers.push(kb.answer);
        }
      }
    }

    return relevantAnswers;
  }

  /**
   * Get dynamic information from APIs
   */
  async getDynamicInfo(context: ChatContext): Promise<string> {
    try {
      switch (context.page) {
        case 'contact':
          return "Our support team is available 24/7 through WhatsApp and email.";
        
        case 'shop':
          // Example API call to get product count
          const productCount = await this.getProductCount();
          return `We currently have ${productCount} products available in our marketplace.`;
        
        case 'vendor-dashboard':
          if (context.userId) {
            const vendorStats = await this.getVendorStats(context.userId);
            return `Your store has ${vendorStats.products} products and ${vendorStats.orders} pending orders.`;
          }
          return "Welcome to the vendor dashboard. Here you can manage your products and orders.";
        
        case 'service-provider-dashboard':
          if (context.userId) {
            const providerStats = await this.getProviderStats(context.userId);
            return `You have ${providerStats.bookings} upcoming bookings and ${providerStats.reviews} new reviews.`;
          }
          return "Welcome to the service provider dashboard. Here you can manage your services and bookings.";
        
        default:
          return "I can help you with information about our platform. What would you like to know?";
      }
    } catch (error) {
      console.error('Error getting dynamic info:', error);
      return "I can help you with information about our platform. What would you like to know?";
    }
  }

  /**
   * Example API call to get product count
   */
  private async getProductCount(): Promise<number> {
    // This would be a real API call in production
    // For now, we'll simulate with a random number
    return Math.floor(Math.random() * 10000) + 5000;
  }

  /**
   * Example API call to get vendor stats
   */
  private async getVendorStats(vendorId: string): Promise<{ products: number; orders: number }> {
    // This would be a real API call in production
    // For now, we'll simulate with random numbers
    return {
      products: Math.floor(Math.random() * 100) + 10,
      orders: Math.floor(Math.random() * 20)
    };
  }

  /**
   * Example API call to get service provider stats
   */
  private async getProviderStats(providerId: string): Promise<{ bookings: number; reviews: number }> {
    // This would be a real API call in production
    // For now, we'll simulate with random numbers
    return {
      bookings: Math.floor(Math.random() * 15),
      reviews: Math.floor(Math.random() * 5)
    };
  }

  /**
   * Save chat history to Firebase
   */
  async saveChatHistory(messages: ChatMessage[], context: ChatContext): Promise<void> {
    try {
      await addDoc(collection(db, 'chatbot-conversations'), {
        messages: messages.map(msg => ({
          ...msg,
          timestamp: Timestamp.fromDate(msg.timestamp)
        })),
        context,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(context: ChatContext): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'chatbot-conversations'),
        where('context.userId', '==', context.userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const latestConversation = querySnapshot.docs[0].data();
        return latestConversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp.toDate()
        }));
      }
    } catch (error) {
      console.error('Error getting chat history:', error);
    }
    
    return [];
  }
}

export const chatbotService = new ChatbotService();