// Script to check and fix image paths
// Usage: node fix-image-paths.js

const fs = require('fs');
const path = require('path');

console.log('Checking and fixing image paths...');

// Check if public/product_images directory exists
const productImagesDir = path.join(__dirname, 'public', 'product_images');
if (!fs.existsSync(productImagesDir)) {
  console.error('Error: public/product_images directory not found!');
  process.exit(1);
}

// List all files in the product_images directory
console.log('Files in public/product_images:');
const files = fs.readdirSync(productImagesDir);
files.forEach(file => {
  console.log(`- ${file}`);
});

// Check if beverages subdirectory exists
const beveragesDir = path.join(productImagesDir, 'beverages');
if (fs.existsSync(beveragesDir)) {
  console.log('\nFiles in public/product_images/beverages:');
  const beverageFiles = fs.readdirSync(beveragesDir);
  beverageFiles.forEach(file => {
    console.log(`- ${file}`);
  });
}

// Create placeholder.jpg if it doesn't exist
const placeholderPath = path.join(__dirname, 'public', 'placeholder.jpg');
if (!fs.existsSync(placeholderPath)) {
  console.log('\nCreating placeholder image...');
  
  // This would normally create a placeholder image file
  // For this example, we'll just log that it would be created
  console.log('Would create placeholder.jpg (skipped for this example)');
  
  /*
  // Example code to create a simple placeholder image
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');
  
  // Fill with light gray
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 400);
  
  // Add text
  ctx.fillStyle = '#999999';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('No Image Available', 200, 200);
  
  // Save to file
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(placeholderPath, buffer);
  */
}

console.log('\nDone checking image paths'); 