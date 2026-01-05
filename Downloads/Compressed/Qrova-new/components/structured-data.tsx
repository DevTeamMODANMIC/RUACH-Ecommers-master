import Script from 'next/script'

interface StructuredDataProps {
  type: 'website' | 'product' | 'organization' | 'breadcrumb'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Grova",
          "url": "https://grova.com",
          "description": "Premium African and international foods, spices, and beverages delivered fresh to your door.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://grova.com/shop?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }
      
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Grova",
          "url": "https://grova.com",
          "logo": "https://grova.com/images/logo/borderlessbuy-logo.png",
          "description": "Premium African and international foods, spices, and beverages delivered fresh to your door.",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "GB"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+44-123-456-7890",
            "contactType": "customer service"
          },
          "sameAs": [
            "https://www.facebook.com/grova",
            "https://www.instagram.com/grova",
            "https://www.twitter.com/grova"
          ]
        }
      
      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "image": data.images,
          "brand": {
            "@type": "Brand",
            "name": "Grova"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "GBP",
            "availability": data.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "Grova"
            }
          },
          "aggregateRating": data.rating ? {
            "@type": "AggregateRating",
            "ratingValue": data.rating,
            "reviewCount": data.reviewCount || 1
          } : undefined
        }
      
      default:
        return data
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSchema())
      }}
    />
  )
}