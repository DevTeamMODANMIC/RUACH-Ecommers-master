

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function ImageTest() {
  const [showDebug, setShowDebug] = useState(false)
  
  const testImages = [
    {
      name: "Placeholder",
      path: "/placeholder.jpg"
    },
    {
      name: "Unnamed Product",
      path: "/product_images/Unnamed_Product_c4e3aaee.jpg"
    },
    {
      name: "Coca Cola",
      path: "/product_images/beverages/coke-50cl-250x250.jpg"
    },
    {
      name: "Vamino Soy Milk",
      path: "/product_images/beverages/Vamino-soy-milk-1-250x250.jpg"
    },
    {
      name: "Teem Pack",
      path: "/product_images/beverages/teem_(Pack).png"
    },
    {
      name: "Sprite Pack",
      path: "/product_images/beverages/sprite_pack.png"
    },
    {
      name: "Lacasara Pack",
      path: "/product_images/beverages/Lacasara_pack.png"
    },
    {
      name: "Malta Guinness Pack",
      path: "/product_images/beverages/malta_guinness_can_(pack_of_24).png"
    },
    {
      name: "Schweppes Chapman",
      path: "/product_images/beverages/swhwappes_chapman_pack_of_24.png"
    }
  ]
  
  return (
    <div className="py-8 bg-[#1e2530]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Image Loading Test</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDebug(!showDebug)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>
        
        {showDebug && (
          <div className="bg-gray-800 p-4 rounded mb-6">
            <h3 className="font-bold mb-2 text-white">Image Paths:</h3>
            <pre className="text-xs overflow-auto text-gray-300">{JSON.stringify(testImages, null, 2)}</pre>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testImages.map((img, index) => (
            <Card key={index} className="overflow-hidden bg-[#1a212b] border-gray-700">
              <div className="relative h-60 bg-[#1a212b]">
                <Image
                  src={img.path}
                  alt={img.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    console.error(`Failed to load image: ${img.path}`);
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.src = "/placeholder.jpg";
                    imgElement.onerror = null;
                  }}
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="font-medium text-white">{img.name}</h3>
                <p className="text-sm text-gray-400 break-all mt-1">{img.path}</p>
              </CardContent>
              <CardFooter>
                <div className="text-xs bg-gray-800 p-2 rounded w-full text-gray-300">
                  <code>{`<img src="${img.path}" alt="${img.name}" fill className="object-contain" />`}</code>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 