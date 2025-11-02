import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, TrendingUp, Clock, Package, Tag, Lightbulb } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getAISearchService, SearchSuggestion } from '../lib/ai-search';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../lib/firebase-products';

interface SmartSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  products?: Product[];
}

export default function SmartSearch({
  onSearch,
  placeholder = "Search for products...",
  className = "",
  products: initialProducts
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseProducts, setFirebaseProducts] = useState<Product[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load Firebase products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Loading Firebase products for AI search...');
        const { products: productsData } = await getProducts({}, 100);
        console.log('Loaded Firebase products:', productsData.length);

        if (productsData.length > 0) {
          // Convert Firebase Product type to main Product type
          const convertedProducts = productsData.map(product => ({
            ...product,
            createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
            updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
          })) as Product[];

          setFirebaseProducts(convertedProducts);
        } else {
          // Fallback to initial products if no Firebase data
          console.log('No Firebase products found, using fallback data');
          setFirebaseProducts(initialProducts || []);
        }
      } catch (error) {
        console.error('Error loading Firebase products:', error);
        setFirebaseProducts(initialProducts || []);
      }
    };

    loadProducts();
  }, [initialProducts]);

  // Use Firebase products if available, otherwise fallback to initial products
  const products = firebaseProducts.length > 0 ? firebaseProducts : (initialProducts || []);
  const aiSearchService = getAISearchService(products);

  // Debounce search suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      try {
        console.log('Generating suggestions for query:', query);
        const newSuggestions = aiSearchService.generateSuggestions(query, 8);
        console.log('Generated suggestions:', newSuggestions);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, aiSearchService]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (!query.trim()) return;

    // Record the search interaction for AI learning
    aiSearchService.recordSearchInteraction(query);

    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Record the interaction for AI learning
    if (suggestion.type === 'product' && suggestion.data) {
      aiSearchService.recordSearchInteraction(suggestion.text, suggestion.data as Product, suggestion);
    } else {
      aiSearchService.recordSearchInteraction(suggestion.text, undefined, suggestion);
    }

    // Navigate based on suggestion type
    if (suggestion.type === 'product' && suggestion.data) {
      navigate(`/products/${(suggestion.data as Product).id}`);
    } else if (suggestion.type === 'category' && suggestion.data) {
      navigate(`/shop?category=${suggestion.data}`);
    } else {
      navigate(`/shop?search=${encodeURIComponent(suggestion.text)}`);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get trending searches for when input is empty
  const trendingSearches = aiSearchService.getTrendingSearches().slice(0, 5);

  // Get suggestion icon based on type
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return <Package className="h-3 w-3" />;
      case 'category':
        return <Tag className="h-3 w-3" />;
      case 'recommendation':
        return <Lightbulb className="h-3 w-3" />;
      default:
        return <Search className="h-3 w-3" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative flex"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className="pl-9 pr-4 h-10 bg-white border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <Button
          type="submit"
          className="h-10 bg-green-600 hover:bg-green-700 rounded-l-none"
        >
          Search
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto mb-2"></div>
              <span className="text-sm">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-green-50 border-l-2 border-green-600'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className={`mr-3 ${index === selectedIndex ? 'text-green-600' : 'text-gray-400'}`}>
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{suggestion.text}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {suggestion.type}
                    </div>
                  </div>
                  <div className="ml-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        suggestion.confidence >= 0.8
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : suggestion.confidence >= 0.6
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">No suggestions found</div>
              <div className="text-xs text-gray-400 mt-1">
                Try searching for products, categories, or brands
              </div>
            </div>
          ) : trendingSearches.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending searches
                </div>
              </div>
              {trendingSearches.map((trendingQuery, index) => (
                <div
                  key={trendingQuery}
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setQuery(trendingQuery);
                    navigate(`/shop?search=${encodeURIComponent(trendingQuery)}`);
                  }}
                >
                  <Clock className="h-3 w-3 mr-3 text-gray-400" />
                  <span className="text-sm text-gray-700">{trendingQuery}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
