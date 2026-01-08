import { MAIN_CATEGORIES } from "../lib/categories"

export default function CategoryTest() {
  // Same filter as in add product page
  const categories = MAIN_CATEGORIES.filter(c => c.id !== 'all' && c.subcategories && c.subcategories.length > 0)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Category Structure Test</h1>
      
      <div className="mb-4">
        <p><strong>Total MAIN_CATEGORIES:</strong> {MAIN_CATEGORIES.length}</p>
        <p><strong>Filtered categories (with subcategories):</strong> {categories.length}</p>
      </div>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="border p-4 rounded">
            <h3 className="font-semibold">
              {category.name} (ID: {category.id})
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Subcategories: {category.subcategories?.length || 0}
            </p>
            
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="ml-4">
                <h4 className="font-medium text-sm mb-1">Subcategories:</h4>
                <ul className="list-disc ml-4 text-sm">
                  {category.subcategories.map((sub) => (
                    <li key={sub.id}>
                      {sub.name} (ID: {sub.id})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-red-600 p-4 border border-red-300 rounded">
          <strong>ERROR:</strong> No categories with subcategories found!
        </div>
      )}
    </div>
  )
}