// Script to copy images from /a to /public/a
// Usage: node copy-a-images.js

const fs = require('fs');
const path = require('path');

console.log('Starting image copy process...');

// Create directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copy file
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✓ Copied: ${path.basename(source)}`);
    return true;
  } catch (err) {
    console.error(`✗ Error copying ${path.basename(source)}: ${err.message}`);
    return false;
  }
}

// Main function
function copyImages() {
  const sourceDir = path.join(__dirname, 'a');
  const destDir = path.join(__dirname, 'public', 'a');
  
  // Ensure destination directory exists
  ensureDirectoryExists(destDir);
  
  // Read all files in the source directory
  try {
    const files = fs.readdirSync(sourceDir);
    console.log(`Found ${files.length} files in ${sourceDir}`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Copy each file
    files.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      
      // Skip directories
      if (fs.statSync(sourcePath).isDirectory()) {
        console.log(`Skipping directory: ${file}`);
        return;
      }
      
      // Copy the file
      if (copyFile(sourcePath, destPath)) {
        successCount++;
      } else {
        failCount++;
      }
    });
    
    console.log('\nCopy process completed:');
    console.log(`- Successfully copied: ${successCount} files`);
    console.log(`- Failed to copy: ${failCount} files`);
    
  } catch (err) {
    console.error(`Error reading directory ${sourceDir}: ${err.message}`);
  }
}

// Run the copy process
copyImages(); 