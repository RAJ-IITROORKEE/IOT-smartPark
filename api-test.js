// Test script for API endpoints
// Run this in browser console at http://localhost:3000

// Test 1: Check if update API is working
fetch('/api/update')
  .then(res => res.json())
  .then(data => {
    console.log('✅ GET /api/update works:', data);
  })
  .catch(err => {
    console.error('❌ GET /api/update failed:', err);
  });

// Test 2: Send fake ESP32 data
fetch('/api/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    distances: [15, 25, 8, null, 30, 12]
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ POST /api/update works:', data);
})
.catch(err => {
  console.error('❌ POST /api/update failed:', err);
});

// Test 3: Admin login
fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Admin login works:', data);
})
.catch(err => {
  console.error('❌ Admin login failed:', err);
});

// Test 4: Check parking spots API
fetch('/api/parking-spots')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Parking spots API works:', data);
  })
  .catch(err => {
    console.error('❌ Parking spots API failed:', err);
  });

console.log('🧪 Running API tests...');