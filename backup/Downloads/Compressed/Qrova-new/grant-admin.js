// Script to grant admin access to a user
// Run with: node grant-admin.js

const https = require('https');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this if your app runs on a different port
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'your-secret-key-here';
const USER_EMAIL = 'victorralph407@gmail.com';

async function grantAdminAccess() {
  try {
    console.log(`Granting admin access to ${USER_EMAIL}...`);
    
    // First, set custom claims
    const adminClaimsResponse = await makeRequest('/api/set-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_SECRET_KEY}`
      },
      body: JSON.stringify({ email: USER_EMAIL })
    });
    
    console.log('Custom claims response:', adminClaimsResponse);
    
    // Then, update profile
    const profileResponse = await makeRequest('/api/set-admin-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_SECRET_KEY}`
      },
      body: JSON.stringify({ email: USER_EMAIL })
    });
    
    console.log('Profile update response:', profileResponse);
    
    console.log(`Successfully granted admin access to ${USER_EMAIL}`);
  } catch (error) {
    console.error('Error granting admin access:', error);
  }
}

function makeRequest(path, options) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${jsonData.error || data}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Run the script
grantAdminAccess();