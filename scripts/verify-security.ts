import http from 'http';

const PORT = 3000; // The port Next.js is running on
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('==================================================');
  console.log('   THE LONDON SHAKES — SECURITY TEST SUITE       ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name: string, ok: boolean, info: string) {
    if (ok) {
      console.log(`[PASS] ${name} — ${info}`);
      passed++;
    } else {
      console.log(`[FAIL] ${name} — ${info}`);
      failed++;
    }
  }

  // Helper to make request
  function makeRequest(
    path: string,
    method: 'GET' | 'POST',
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<{ status: number; data: string; headers: http.IncomingHttpHeaders }> {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : '';
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: PORT,
          path: path,
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            ...headers,
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({
              status: res.statusCode || 0,
              data,
              headers: res.headers,
            });
          });
        }
      );
      req.on('error', (err) => reject(err));
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  // --- 1. Smoke Test (Home API or Public Assets) ---
  try {
    const res = await makeRequest('/', 'GET');
    report('SMOKE_TEST', res.status === 200, `Root page returned status ${res.status}`);
  } catch (err: any) {
    report('SMOKE_TEST', false, `Failed to reach home: ${err.message}`);
  }

  // --- 2. Authorization Test (Protected Admin API without session) ---
  try {
    const res = await makeRequest('/api/admin/settings', 'GET');
    // Middleware should redirect (307) or block (401)
    const isProtected = res.status === 307 || res.status === 401 || res.status === 302;
    report(
      'AUTH_ENFORCEMENT',
      isProtected,
      `API returned status ${res.status} (expected redirect or unauthorized)`
    );
  } catch (err: any) {
    report('AUTH_ENFORCEMENT', false, `Request failed: ${err.message}`);
  }

  // --- 3. Input Validation Test (Orders Endpoint with malformed data) ---
  try {
    const malformedOrder = {
      id: 'test-order-id-123',
      customerName: '', // empty name
      address: {
        email: 'invalid-email',
        phone: '123',
      },
      items: [],
      total: -50,
    };
    const res = await makeRequest('/api/orders', 'POST', malformedOrder);
    report(
      'INPUT_VALIDATION',
      res.status === 400,
      `API returned status ${res.status} for malformed payload (expected 400)`
    );
  } catch (err: any) {
    report('INPUT_VALIDATION', false, `Request failed: ${err.message}`);
  }

  // --- 4. Rate Limiting Test (Verify Passcode attempts check) ---
  try {
    console.log('\n[INFO] Sending 6 passcode check requests to test rate limiter...');
    let statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await makeRequest('/api/admin/settings/verify-passcode', 'POST', {
        passcode: 'wrong-code',
      }, {
        'Cookie': 'tls_admin_session=authenticated'
      });
      statuses.push(res.status);
    }
    const has429 = statuses.includes(429);
    report(
      'RATE_LIMIT_PASSCODE',
      has429,
      `Received response statuses: ${statuses.join(', ')} (expected 429 in sequence)`
    );
  } catch (err: any) {
    report('RATE_LIMIT_PASSCODE', false, `Request failed: ${err.message}`);
  }

  // --- 5. Rate Limiting Test (Orders submissions check) ---
  try {
    console.log('\n[INFO] Sending 11 order requests to test order rate limiter...');
    let statuses: number[] = [];
    const dummyOrder = {
      id: 'test-dummy-order',
      customerName: 'Test Client',
      address: {
        email: 'client@example.com',
        phone: '+919999999999',
      },
      items: [{ name: 'Dummy Item', price: 100, qty: 1 }],
      total: 100,
      type: 'pickup',
      status: 'pending',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
    };
    for (let i = 0; i < 11; i++) {
      const res = await makeRequest('/api/orders', 'POST', dummyOrder);
      statuses.push(res.status);
    }
    const has429 = statuses.includes(429);
    report(
      'RATE_LIMIT_ORDERS',
      has429,
      `Received response statuses: ${statuses.join(', ')} (expected 429 in sequence)`
    );
  } catch (err: any) {
    report('RATE_LIMIT_ORDERS', false, `Request failed: ${err.message}`);
  }

  console.log('\n==================================================');
  console.log(`   TEST RESULT: PASSED=${passed} FAILED=${failed}  `);
  console.log('==================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
