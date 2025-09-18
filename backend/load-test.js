/**
 * MicroFi Banking SaaS - Load Testing Script
 * Tests system performance under concurrent load
 */

const API_BASE = 'http://127.0.0.1:8787';
const CONCURRENT_USERS = 50;
const TEST_DURATION = 60000; // 1 minute
const RAMP_UP_TIME = 10000; // 10 seconds

// Test credentials
const TEST_USERS = [
  { email: 'john.doe@microfi.com', password: 'demo123' },
  { email: 'sarah.admin@microfi.com', password: 'admin123' },
  { email: 'mike.business@microfi.com', password: 'business123' }
];

class LoadTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null
    };
    this.activeUsers = 0;
    this.tokens = new Map();
  }

  async makeRequest(url, options = {}) {
    const startTime = Date.now();
    this.results.totalRequests++;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const responseTime = Date.now() - startTime;
      this.results.responseTimes.push(responseTime);
      
      if (responseTime > this.results.maxResponseTime) {
        this.results.maxResponseTime = responseTime;
      }
      if (responseTime < this.results.minResponseTime) {
        this.results.minResponseTime = responseTime;
      }

      if (response.ok) {
        this.results.successfulRequests++;
        return await response.json();
      } else {
        this.results.failedRequests++;
        this.results.errors.push({
          url,
          status: response.status,
          statusText: response.statusText,
          responseTime
        });
        return null;
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.results.failedRequests++;
      this.results.errors.push({
        url,
        error: error.message,
        responseTime
      });
      return null;
    }
  }

  async authenticateUser(userIndex) {
    const user = TEST_USERS[userIndex % TEST_USERS.length];
    const response = await this.makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(user)
    });

    if (response && response.token) {
      this.tokens.set(userIndex, response.token);
      return response.token;
    }
    return null;
  }

  async testHealthCheck() {
    return await this.makeRequest(`${API_BASE}/health`);
  }

  async testDetailedHealth() {
    return await this.makeRequest(`${API_BASE}/health/detailed`);
  }

  async testGetAccounts(token) {
    return await this.makeRequest(`${API_BASE}/api/accounts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  async testGetTransactions(token) {
    return await this.makeRequest(`${API_BASE}/api/payments/transactions?limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  async testFeeEstimation() {
    return await this.makeRequest(`${API_BASE}/api/payments/fees/estimate?type=internal_transfer&amount=100&currency=GHS`);
  }

  async testPaymentInitialization(token) {
    return await this.makeRequest(`${API_BASE}/api/payments/paystack/initialize`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        amount: 1000,
        email: 'test@microfi.com'
      })
    });
  }

  async simulateUser(userIndex) {
    console.log(`🚀 Starting user ${userIndex + 1}`);
    this.activeUsers++;

    try {
      // Authenticate
      const token = await this.authenticateUser(userIndex);
      if (!token) {
        console.log(`❌ User ${userIndex + 1} authentication failed`);
        return;
      }

      // Simulate user behavior
      const actions = [
        () => this.testHealthCheck(),
        () => this.testGetAccounts(token),
        () => this.testGetTransactions(token),
        () => this.testFeeEstimation(),
        () => this.testPaymentInitialization(token)
      ];

      // Perform random actions for the test duration
      const endTime = Date.now() + TEST_DURATION;
      while (Date.now() < endTime) {
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        await randomAction();
        
        // Random delay between actions (100-500ms)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
      }

      console.log(`✅ User ${userIndex + 1} completed`);
    } catch (error) {
      console.log(`❌ User ${userIndex + 1} error:`, error.message);
    } finally {
      this.activeUsers--;
    }
  }

  async runLoadTest() {
    console.log('🏦 MicroFi Banking SaaS - Load Testing');\n    console.log(`📊 Configuration:`);\n    console.log(`   - Concurrent Users: ${CONCURRENT_USERS}`);\n    console.log(`   - Test Duration: ${TEST_DURATION / 1000}s`);\n    console.log(`   - Ramp-up Time: ${RAMP_UP_TIME / 1000}s`);\n    console.log(`   - Target: ${API_BASE}\\n`);\n\n    this.results.startTime = Date.now();\n\n    // Test system health before load test\n    console.log('🔍 Pre-test health check...');\n    const healthCheck = await this.testDetailedHealth();\n    if (healthCheck) {\n      console.log('✅ System healthy, starting load test\\n');\n    } else {\n      console.log('❌ System health check failed, aborting\\n');\n      return;\n    }\n\n    // Ramp up users gradually\n    const userPromises = [];\n    const rampUpInterval = RAMP_UP_TIME / CONCURRENT_USERS;\n\n    for (let i = 0; i < CONCURRENT_USERS; i++) {\n      setTimeout(() => {\n        userPromises.push(this.simulateUser(i));\n      }, i * rampUpInterval);\n    }\n\n    // Monitor progress\n    const progressInterval = setInterval(() => {\n      console.log(`📈 Active users: ${this.activeUsers}, Requests: ${this.results.totalRequests}, Success rate: ${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(1)}%`);\n    }, 5000);\n\n    // Wait for all users to complete\n    await Promise.all(userPromises);\n    clearInterval(progressInterval);\n\n    this.results.endTime = Date.now();\n    this.generateReport();\n  }\n\n  generateReport() {\n    const totalTime = this.results.endTime - this.results.startTime;\n    const requestsPerSecond = (this.results.totalRequests / (totalTime / 1000)).toFixed(2);\n    const successRate = ((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2);\n    \n    // Calculate percentiles\n    const sortedTimes = this.results.responseTimes.sort((a, b) => a - b);\n    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0;\n    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;\n    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;\n    \n    this.results.averageResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length || 0;\n\n    console.log('\\n🎯 LOAD TEST RESULTS');\n    console.log('=' .repeat(50));\n    console.log(`📊 Summary:`);\n    console.log(`   - Total Requests: ${this.results.totalRequests}`);\n    console.log(`   - Successful: ${this.results.successfulRequests}`);\n    console.log(`   - Failed: ${this.results.failedRequests}`);\n    console.log(`   - Success Rate: ${successRate}%`);\n    console.log(`   - Requests/sec: ${requestsPerSecond}`);\n    console.log(`   - Test Duration: ${(totalTime / 1000).toFixed(1)}s\\n`);\n    \n    console.log(`⏱️  Response Times:`);\n    console.log(`   - Average: ${this.results.averageResponseTime.toFixed(2)}ms`);\n    console.log(`   - Min: ${this.results.minResponseTime}ms`);\n    console.log(`   - Max: ${this.results.maxResponseTime}ms`);\n    console.log(`   - 50th percentile: ${p50}ms`);\n    console.log(`   - 95th percentile: ${p95}ms`);\n    console.log(`   - 99th percentile: ${p99}ms\\n`);\n\n    // Performance benchmarks\n    console.log('🎯 Performance Benchmarks:');\n    console.log(`   - API Response (95th): ${p95 < 100 ? '✅' : '❌'} ${p95}ms (target: <100ms)`);\n    console.log(`   - Success Rate: ${successRate >= 99 ? '✅' : '❌'} ${successRate}% (target: >99%)`);\n    console.log(`   - Requests/sec: ${parseFloat(requestsPerSecond) >= 100 ? '✅' : '❌'} ${requestsPerSecond} (target: >100)`);\n    console.log(`   - Max Response: ${this.results.maxResponseTime < 1000 ? '✅' : '❌'} ${this.results.maxResponseTime}ms (target: <1000ms)\\n`);\n\n    if (this.results.errors.length > 0) {\n      console.log('❌ Errors:');\n      const errorSummary = {};\n      this.results.errors.forEach(error => {\n        const key = error.status || error.error || 'Unknown';\n        errorSummary[key] = (errorSummary[key] || 0) + 1;\n      });\n      \n      Object.entries(errorSummary).forEach(([error, count]) => {\n        console.log(`   - ${error}: ${count} occurrences`);\n      });\n      console.log();\n    }\n\n    // Banking performance assessment\n    const bankingGrade = this.assessBankingPerformance(successRate, p95, parseFloat(requestsPerSecond));\n    console.log(`🏦 Banking Performance Grade: ${bankingGrade}\\n`);\n  }\n\n  assessBankingPerformance(successRate, p95, rps) {\n    if (successRate >= 99.9 && p95 < 50 && rps >= 200) {\n      return '🏆 EXCELLENT (Production Ready)';\n    } else if (successRate >= 99.5 && p95 < 100 && rps >= 100) {\n      return '✅ GOOD (Banking Standard)';\n    } else if (successRate >= 99 && p95 < 200 && rps >= 50) {\n      return '⚠️  ACCEPTABLE (Needs Optimization)';\n    } else {\n      return '❌ POOR (Not Production Ready)';\n    }\n  }\n}\n\n// Run the load test\nif (require.main === module) {\n  const tester = new LoadTester();\n  tester.runLoadTest().catch(console.error);\n}\n\nmodule.exports = LoadTester;