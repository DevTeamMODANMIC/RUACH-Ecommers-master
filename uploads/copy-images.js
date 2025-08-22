// Script to copy product images from one directory to another
// Usage: node copy-images.js

const fs = require('fs');
const path = require('path');

// Configuration
const sourceDir = path.join(__dirname, 'public', 'product_images');
const targetDir = path.join(__dirname, 'public', 'product_images_fixed');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Read all files from source directory
try {
  const files = fs.readdirSync(sourceDir);
  console.log(`Found ${files.length} files in source directory`);
  
  // Process each file
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    
    // Replace spaces with underscores in the filename
    const fixedFilename = file.replace(/ /g, '_');
    const targetPath = path.join(targetDir, fixedFilename);
    
    try {
      // Copy the file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${file} -> ${fixedFilename}`);
    } catch (err) {
      console.error(`Error copying ${file}:`, err);
    }
  });
  
  console.log('Done! All files processed.');
  console.log(`Files copied from ${sourceDir} to ${targetDir}`);
  console.log('You can now move the files from the target directory to replace the originals if needed.');
} catch (err) {
  console.error('Error reading source directory:', err);
} 