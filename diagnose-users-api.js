// Diagnostic script to check Users API
// Run with: node diagnose-users-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function checkUsersAPI() {
  console.log('🔍 Diagnosing Users API...\n');

  try {
    // Try to fetch users
    console.log('1️⃣ Testing GET /api/settings/users');
    const response = await axios.get(`${BASE_URL}/api/settings/users`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.users) {
      console.log(`\n👥 Found ${response.data.users.length} users`);
      
      if (response.data.users.length > 0) {
        console.log('\n📋 First user structure:');
        console.log(JSON.stringify(response.data.users[0], null, 2));
        
        console.log('\n🔑 Available fields in first user:');
        console.log(Object.keys(response.data.users[0]));
      } else {
        console.log('\n⚠️  No users in database');
      }
    } else {
      console.log('\n❌ Unexpected response structure - no "users" field');
      console.log('Response keys:', Object.keys(response.data));
    }

  } catch (error) {
    console.error('❌ Error fetching users:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the backend running?');
      console.error('Backend URL:', BASE_URL);
    } else {
      console.error('Error:', error.message);
    }
  }

  console.log('\n---\n');

  // Try to list all users with credentials (testing endpoint)
  try {
    console.log('2️⃣ Testing GET /api/admin/users/credentials');
    const response = await axios.get(`${BASE_URL}/api/admin/users/credentials`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Status:', response.status);
    console.log('📦 Credentials Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.users) {
      console.log(`\n🔐 Found ${response.data.users.length} users with credentials`);
      
      if (response.data.users.length > 0) {
        console.log('\n📋 First credential user structure:');
        console.log(JSON.stringify(response.data.users[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error fetching credentials:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from credentials endpoint');
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkUsersAPI();
