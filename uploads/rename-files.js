// Script to rename files with spaces to use underscores
// Usage: node rename-files.js

const fs = require('fs');
const path = require('path');

console.log('Starting file renaming process...');

// Function to rename files in a directory
function renameFilesInDir(dirPath) {
  console.log(`\nChecking files in: ${dirPath}`);
  
  try {
    // Read all files in the directory
    const files = fs.readdirSync(dirPath);
    
    // Process each file
    files.forEach(file => {
      // Skip directories
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        // Recursively process subdirectories
        renameFilesInDir(filePath);
        return;
      }
      
      // Check if filename has spaces
      if (file.includes(' ')) {
        const newName = file.replace(/ /g, '_');
        const newPath = path.join(dirPath, newName);
        
        console.log(`Renaming: "${file}" -> "${newName}"`);
        
        try {
          fs.renameSync(filePath, newPath);
          console.log(`  ✓ Success`);
        } catch (err) {
          console.error(`  ✗ Error: ${err.message}`);
        }
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dirPath}: ${err.message}`);
  }
}

// Start with the public/product_images directory
const productImagesDir = path.join(__dirname, 'public', 'product_images');
renameFilesInDir(productImagesDir);

console.log('\nFile renaming process completed.'); 