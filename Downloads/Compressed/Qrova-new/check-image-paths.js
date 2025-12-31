// Script to check if all image paths in the product data are valid
// Usage: node check-image-paths.js

const fs = require('fs');
const path = require('path');

console.log('Starting image path check...');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Function to get all products from products.json
function getProducts() {
  try {
    // First check if products.json exists
    const productsPath = path.join(__dirname, 'products.json');
    
    if (fileExists(productsPath)) {
      const fileContent = fs.readFileSync(productsPath, 'utf8');
      try {
        return JSON.parse(fileContent);
      } catch (error) {
        console.error('Error parsing products.json:', error);
        return [];
      }
    } else {
      console.log('products.json not found. Creating sample file...');
      // This could be expanded to create a sample products.json
      return [];
    }
  } catch (err) {
    console.error(`Error reading products file:`, err);
    return [];
  }
}

// Main function
function checkImagePaths() {
  // Get products
  const products = getProducts();
  
  console.log(`Found ${products.length} products to check`);
  
  // Check each image path
  const results = {
    valid: 0,
    invalid: 0,
    paths: []
  };
  
  products.forEach((product, index) => {
    if (!product.images) {
      console.log(`Product #${index + 1} (${product.name || 'Unknown'}) has no images array`);
      return;
    }
    
    product.images.forEach(imagePath => {
      // Skip empty strings
      if (!imagePath) {
        return;
      }
      
      // Remove leading slash for path resolution
      const relativePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      
      // Check in different locations
      const locations = [
        path.join(__dirname, 'public', relativePath),
        path.join(__dirname, relativePath),
        path.join(__dirname, 'public', 'product_images', path.basename(relativePath)),
        path.join(__dirname, 'public', 'a', path.basename(relativePath))
      ];
      
      let exists = false;
      let validPath = '';
      
      for (const location of locations) {
        if (fileExists(location)) {
          exists = true;
          validPath = location;
          break;
        }
      }
      
      results.paths.push({
        path: imagePath,
        exists,
        validPath: exists ? validPath : null,
        product: `${product.name} (${product.id})`
      });
      
      if (exists) {
        results.valid++;
      } else {
        results.invalid++;
      }
    });
  });
  
  // Print results
  console.log('\nResults:');
  console.log(`Total image paths checked: ${results.valid + results.invalid}`);
  console.log(`Valid paths: ${results.valid}`);
  console.log(`Invalid paths: ${results.invalid}`);
  
  if (results.invalid > 0) {
    console.log('\nInvalid image paths:');
    results.paths
      .filter(p => !p.exists)
      .forEach(p => {
        console.log(`- ${p.path} (product: ${p.product})`);
      });
  }
  
  // Suggest fixes
  if (results.invalid > 0) {
    console.log('\nSuggested fixes:');
    console.log('1. Ensure images are in one of these directories:');
    console.log('   - public/product_images/');
    console.log('   - public/a/');
    console.log('2. Update product image paths in products.json to point to valid locations');
    console.log('3. Run this script again to verify fixes');
  }
}

checkImagePaths();

console.log('\nImage path check completed.'); 