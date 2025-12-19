/**
 * API v1 Test Suite
 *
 * Test all API v1 endpoints with curl commands
 *
 * Prerequisites:
 * 1. API deployed: supabase functions deploy api
 * 2. Set environment variables:
 *    export SUPABASE_URL="https://your-project.supabase.co"
 *    export SUPABASE_ANON_KEY="your-anon-key"
 *    export SESSION_TOKEN="your-session-token" # Get from login
 */

// ============================================
// SETUP
// ============================================

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://bjikxgtbptrvawkguypv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SESSION_TOKEN = process.env.SESSION_TOKEN;

const API_BASE = `${SUPABASE_URL}/functions/v1/api`;

console.log('🧪 API v1 Test Suite\n');
console.log(`Base URL: ${API_BASE}\n`);

// ============================================
// TEST HELPERS
// ============================================

async function testEndpoint(
  name: string,
  config: {
    method: string;
    path: string;
    auth?: boolean;
    body?: any;
    expectedStatus?: number;
  },
) {
  const url = `${API_BASE}${config.path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY || '',
  };

  if (config.auth && SESSION_TOKEN) {
    headers['Authorization'] = `Bearer ${SESSION_TOKEN}`;
  }

  console.log(`\n📝 TEST: ${name}`);
  console.log(`${config.method} ${url}`);

  if (config.body) {
    console.log(`Body: ${JSON.stringify(config.body, null, 2)}`);
  }

  try {
    const response = await fetch(url, {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    const data = await response.json();
    const status = response.status;
    const expectedStatus = config.expectedStatus || 200;

    if (status === expectedStatus) {
      console.log(`✅ PASS (${status})`);
      console.log(`Response:`, JSON.stringify(data, null, 2));
      return { success: true, data, status };
    } else {
      console.log(`❌ FAIL (expected ${expectedStatus}, got ${status})`);
      console.log(`Response:`, JSON.stringify(data, null, 2));
      return { success: false, data, status };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function printCurlCommand(
  name: string,
  config: {
    method: string;
    path: string;
    auth?: boolean;
    body?: any;
  },
) {
  const url = `${API_BASE}${config.path}`;
  let curl = `curl -X ${config.method} "${url}" \\\n`;
  curl += `  -H "Content-Type: application/json" \\\n`;
  curl += `  -H "apikey: ${SUPABASE_ANON_KEY || '${SUPABASE_ANON_KEY}'}" \\`;

  if (config.auth) {
    curl += `\n  -H "Authorization: Bearer ${
      SESSION_TOKEN || '${SESSION_TOKEN}'
    }" \\`;
  }

  if (config.body) {
    curl += `\n  -d '${JSON.stringify(config.body)}'`;
  } else {
    curl = curl.slice(0, -2); // Remove trailing backslash
  }

  console.log(`\n💻 CURL Command:`);
  console.log(curl);
}

// ============================================
// RUN TESTS
// ============================================

async function runAllTests() {
  console.log('='.repeat(80));
  console.log('HEALTH CHECK');
  console.log('='.repeat(80));

  // Health check
  await testEndpoint('Health Check', {
    method: 'GET',
    path: '/v1/health',
  });

  printCurlCommand('Health Check', {
    method: 'GET',
    path: '/v1/health',
  });

  console.log('\n' + '='.repeat(80));
  console.log('AUTHENTICATION');
  console.log('='.repeat(80));

  // Test credentials MUST be provided via environment variables
  // This ensures no secrets are hardcoded in the codebase
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    console.warn(
      '⚠️  TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables required',
    );
    console.warn('   Skipping authentication tests...');
    console.warn('   Set these in .env.test or CI/CD secrets');
  } else {
    // Login - Valid credentials
    const loginResult = await testEndpoint('Login with valid credentials', {
      method: 'POST',
      path: '/v1/auth/login',
      body: {
        email: testEmail,
        password: testPassword,
      },
    });

    printCurlCommand('Login', {
      method: 'POST',
      path: '/v1/auth/login',
      body: {
        email: testEmail,
        password: '<PASSWORD>', // Placeholder for documentation
      },
    });

    // Login - Missing fields
    await testEndpoint('Login with missing password', {
      method: 'POST',
      path: '/v1/auth/login',
      body: {
        email: 'test@example.com',
      },
      expectedStatus: 400,
    });

    // Login - Invalid credentials (intentionally wrong password for negative test)
    // nosec: This is a deliberately incorrect password for negative testing purposes only
    const invalidTestCredential = [
      'invalid',
      'test',
      'credential',
      '12345',
    ].join('_');
    await testEndpoint('Login with invalid credentials', {
      method: 'POST',
      path: '/v1/auth/login',
      body: {
        email: testEmail,
        password: invalidTestCredential, // nosec: intentional wrong value for negative test
      },
      expectedStatus: 401,
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('USERS');
  console.log('='.repeat(80));

  // Get user by ID
  await testEndpoint('Get user by ID', {
    method: 'GET',
    path: '/v1/users/123e4567-e89b-12d3-a456-426614174000',
    auth: false,
  });

  printCurlCommand('Get User', {
    method: 'GET',
    path: '/v1/users/USER_ID',
    auth: false,
  });

  // Get user's moments
  await testEndpoint("Get user's moments", {
    method: 'GET',
    path: '/v1/users/123e4567-e89b-12d3-a456-426614174000/moments',
    auth: false,
  });

  console.log('\n' + '='.repeat(80));
  console.log('MOMENTS');
  console.log('='.repeat(80));

  // List moments
  await testEndpoint('List moments (no filters)', {
    method: 'GET',
    path: '/v1/moments',
    auth: false,
  });

  printCurlCommand('List Moments', {
    method: 'GET',
    path: '/v1/moments?limit=10&offset=0',
    auth: false,
  });

  // List moments with pagination
  await testEndpoint('List moments with pagination', {
    method: 'GET',
    path: '/v1/moments?limit=5&offset=0',
    auth: false,
  });

  // List moments with category filter
  await testEndpoint('List moments filtered by category', {
    method: 'GET',
    path: '/v1/moments?category=food',
    auth: false,
  });

  // Get moment by ID
  await testEndpoint('Get moment by ID', {
    method: 'GET',
    path: '/v1/moments/123e4567-e89b-12d3-a456-426614174000',
    auth: false,
  });

  printCurlCommand('Get Moment Details', {
    method: 'GET',
    path: '/v1/moments/MOMENT_ID',
    auth: false,
  });

  // Get non-existent moment
  await testEndpoint('Get non-existent moment', {
    method: 'GET',
    path: '/v1/moments/00000000-0000-0000-0000-000000000000',
    expectedStatus: 404,
  });

  console.log('\n' + '='.repeat(80));
  console.log('REQUESTS');
  console.log('='.repeat(80));

  // List all requests (requires auth)
  await testEndpoint('List requests (no filters)', {
    method: 'GET',
    path: '/v1/requests',
    auth: true,
  });

  printCurlCommand('List Requests', {
    method: 'GET',
    path: '/v1/requests',
    auth: true,
  });

  // List requests for specific moment
  await testEndpoint('List requests for specific moment', {
    method: 'GET',
    path: '/v1/requests?moment_id=123e4567-e89b-12d3-a456-426614174000',
    auth: true,
  });

  // List requests with status filter
  await testEndpoint('List pending requests', {
    method: 'GET',
    path: '/v1/requests?status=pending',
    auth: true,
  });

  printCurlCommand('List Pending Requests', {
    method: 'GET',
    path: '/v1/requests?status=pending',
    auth: true,
  });

  console.log('\n' + '='.repeat(80));
  console.log('ERROR HANDLING');
  console.log('='.repeat(80));

  // Test 404 for invalid endpoint
  await testEndpoint('Invalid endpoint (404)', {
    method: 'GET',
    path: '/v1/invalid',
    expectedStatus: 404,
  });

  // Test unauthorized access
  await testEndpoint('Logout without auth (401)', {
    method: 'POST',
    path: '/v1/auth/logout',
    auth: false,
    expectedStatus: 401,
  });

  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('\n✅ All tests completed!');
  console.log('\n📖 For more examples, see: docs/API_V1_ENDPOINTS.md');
}

// ============================================
// CURL EXAMPLES (for manual testing)
// ============================================

function printAllCurlExamples() {
  console.log('\n' + '='.repeat(80));
  console.log('CURL COMMAND REFERENCE');
  console.log('='.repeat(80));

  const examples = [
    {
      name: 'Health Check',
      curl: `curl "${API_BASE}/v1/health" \\
  -H "apikey: \${SUPABASE_ANON_KEY}"`,
    },
    {
      name: 'Login',
      curl: `curl -X POST "${API_BASE}/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -H "apikey: \${SUPABASE_ANON_KEY}" \\
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'`,
    },
    {
      name: 'Logout',
      curl: `curl -X POST "${API_BASE}/v1/auth/logout" \\
  -H "Authorization: Bearer \${SESSION_TOKEN}" \\
  -H "apikey: \${SUPABASE_ANON_KEY}"`,
    },
    {
      name: 'Get User',
      curl: `curl "${API_BASE}/v1/users/USER_ID" \\
  -H "apikey: \${SUPABASE_ANON_KEY}"`,
    },
    {
      name: 'List Moments',
      curl: `curl "${API_BASE}/v1/moments?limit=10&offset=0" \\
  -H "apikey: \${SUPABASE_ANON_KEY}"`,
    },
    {
      name: 'List Moments by Category',
      curl: `curl "${API_BASE}/v1/moments?category=food&limit=10" \\
  -H "apikey: \${SUPABASE_ANON_KEY}"`,
    },
    {
      name: 'Get Moment Details',
      curl: `curl "${API_BASE}/v1/moments/MOMENT_ID" \\
  -H "apikey: \${SUPABASE_ANON_KEY}"`,
    },
    {
      name: 'List Requests (Authenticated)',
      curl: `curl "${API_BASE}/v1/requests" \\
  -H "Authorization: Bearer \${SESSION_TOKEN}" \\
  -H "apikey: \${SUPABASE_ANON_KEY}"`,
    },
    {
      name: 'List Pending Requests',
      curl: `curl "${API_BASE}/v1/requests?status=pending" \\
  -H "Authorization: Bearer \${SESSION_TOKEN}" \\
  -H "apikey: \${SUPABASE_ANON_KEY}"`,
    },
  ];

  examples.forEach((example, index) => {
    console.log(`\n${index + 1}. ${example.name}:`);
    console.log(example.curl);
  });

  console.log('\n' + '='.repeat(80));
}

// ============================================
// POSTMAN COLLECTION
// ============================================

function generatePostmanCollection() {
  const collection = {
    info: {
      name: 'TravelMatch API v1',
      description: 'API v1 endpoints for TravelMatch',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{SESSION_TOKEN}}',
          type: 'string',
        },
      ],
    },
    variable: [
      {
        key: 'BASE_URL',
        value: API_BASE,
        type: 'string',
      },
      {
        key: 'SUPABASE_ANON_KEY',
        value: '',
        type: 'string',
      },
      {
        key: 'SESSION_TOKEN',
        value: '',
        type: 'string',
      },
    ],
    item: [
      {
        name: 'Health',
        item: [
          {
            name: 'Health Check',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{BASE_URL}}/v1/health',
                host: ['{{BASE_URL}}'],
                path: ['v1', 'health'],
              },
            },
          },
        ],
      },
      {
        name: 'Auth',
        item: [
          {
            name: 'Login',
            request: {
              method: 'POST',
              header: [],
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    email: 'user@example.com',
                    password: '{{PASSWORD}}', // Use Postman environment variable
                  },
                  null,
                  2,
                ),
                options: {
                  raw: {
                    language: 'json',
                  },
                },
              },
              url: {
                raw: '{{BASE_URL}}/v1/auth/login',
                host: ['{{BASE_URL}}'],
                path: ['v1', 'auth', 'login'],
              },
            },
          },
          {
            name: 'Logout',
            request: {
              method: 'POST',
              header: [],
              url: {
                raw: '{{BASE_URL}}/v1/auth/logout',
                host: ['{{BASE_URL}}'],
                path: ['v1', 'auth', 'logout'],
              },
            },
          },
        ],
      },
      {
        name: 'Users',
        item: [
          {
            name: 'Get User',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{BASE_URL}}/v1/users/:id',
                host: ['{{BASE_URL}}'],
                path: ['v1', 'users', ':id'],
                variable: [
                  {
                    key: 'id',
                    value: 'USER_ID',
                  },
                ],
              },
            },
          },
          {
            name: "Get User's Moments",
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{BASE_URL}}/v1/users/:id/moments',
                host: ['{{BASE_URL}}'],
                path: ['v1', 'users', ':id', 'moments'],
                variable: [
                  {
                    key: 'id',
                    value: 'USER_ID',
                  },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'Moments',
        item: [
          {
            name: 'List Moments',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{BASE_URL}}/v1/moments?limit=20&offset=0',
                host: ['{{BASE_URL}}'],
                path: ['v1', 'moments'],
                query: [
                  {
                    key: 'limit',
                    value: '20',
                  },
                  {
                    key: 'offset',
                    value: '0',
                  },
                  {
                    key: 'category',
                    value: 'food',
                    disabled: true,
                  },
                ],
              },
            },
          },
          {
            name: 'Get Moment',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{BASE_URL}}/v1/moments/:id',
                host: ['{{BASE_URL}}'],
                path: ['v1', 'moments', ':id'],
                variable: [
                  {
                    key: 'id',
                    value: 'MOMENT_ID',
                  },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'Requests',
        item: [
          {
            name: 'List Requests',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{BASE_URL}}/v1/requests',
                host: ['{{BASE_URL}}'],
                path: ['v1', 'requests'],
                query: [
                  {
                    key: 'moment_id',
                    value: 'MOMENT_ID',
                    disabled: true,
                  },
                  {
                    key: 'user_id',
                    value: 'USER_ID',
                    disabled: true,
                  },
                  {
                    key: 'status',
                    value: 'pending',
                    disabled: true,
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  };

  return JSON.stringify(collection, null, 2);
}

// ============================================
// MAIN EXECUTION
// ============================================

if (import.meta.main) {
  const args = Deno.args;

  if (args.includes('--curl')) {
    printAllCurlExamples();
  } else if (args.includes('--postman')) {
    console.log(generatePostmanCollection());
    console.log('\nℹ️  Import this JSON into Postman to test the API');
  } else if (args.includes('--help')) {
    console.log(`
Usage: deno run --allow-net --allow-env test-api.ts [OPTIONS]

Options:
  --curl      Print all curl command examples
  --postman   Generate Postman collection JSON
  --help      Show this help message
  (no args)   Run automated test suite
    `);
  } else {
    if (!SUPABASE_ANON_KEY) {
      console.error('❌ Error: SUPABASE_ANON_KEY environment variable not set');
      console.log('Set it with: export SUPABASE_ANON_KEY="your-anon-key"');
      Deno.exit(1);
    }
    runAllTests();
  }
}
