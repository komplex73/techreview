const http = require('http');

const data = JSON.stringify({
  username: 'test_db_user_' + Date.now(),
  email: 'test_db_' + Date.now() + '@example.com',
  password: 'password123',
  age: 25,
  gender: 'Erkek',
  bio: 'Test user for DB creation'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
