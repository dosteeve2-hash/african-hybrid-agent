#!/usr/bin/env node

/**
 * Load testing script for African Hybrid Agent
 * Tests: Chat API, Cache performance, Vector search
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const NUM_REQUESTS = parseInt(process.env.NUM_REQUESTS || '50');
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10');

let completed = 0;
let errors = 0;
let totalTime = 0;
let minTime = Infinity;
let maxTime = 0;
const times = [];

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const elapsed = Date.now() - startTime;
        times.push(elapsed);
        totalTime += elapsed;
        minTime = Math.min(minTime, elapsed);
        maxTime = Math.max(maxTime, elapsed);
        resolve({ status: res.statusCode, elapsed, data });
      });
    });

    req.on('error', (err) => {
      errors++;
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testChat() {
  console.log('\n📊 Testing Chat API...');
  const payload = {
    messages: [
      {
        role: 'user',
        content: 'Quel est le problème principal en agriculture africaine?',
      },
    ],
    mode: 'general',
    searchMode: 'semantic',
  };

  let cacheHits = 0;

  for (let i = 0; i < NUM_REQUESTS; i++) {
    try {
      const result = await makeRequest('POST', '/api/chat', payload);
      if (result.data.includes('fromCache')) cacheHits++;
      process.stdout.write('.');
    } catch (err) {
      process.stdout.write('E');
    }
  }

  console.log(`\n✅ Chat API: ${NUM_REQUESTS} requests`);
  console.log(`   Cache hits: ${cacheHits}/${NUM_REQUESTS} (${(cacheHits / NUM_REQUESTS * 100).toFixed(1)}%)`);
}

async function testVectorSearch() {
  console.log('\n📊 Testing Vector Search API...');
  const payload = { query: 'agriculture', limit: 5 };

  let cacheHits = 0;

  for (let i = 0; i < NUM_REQUESTS; i++) {
    try {
      const result = await makeRequest('POST', '/api/search/vector', payload);
      if (result.data.includes('fromCache')) cacheHits++;
      process.stdout.write('.');
    } catch (err) {
      process.stdout.write('E');
    }
  }

  console.log(`\n✅ Vector Search: ${NUM_REQUESTS} requests`);
  console.log(`   Cache hits: ${cacheHits}/${NUM_REQUESTS} (${(cacheHits / NUM_REQUESTS * 100).toFixed(1)}%)`);
}

async function testCache() {
  console.log('\n📊 Testing Cache Stats...');

  try {
    const result = await makeRequest('GET', '/api/cache');
    const data = JSON.parse(result.data);
    console.log('✅ Cache Stats:');
    console.log(`   Connected: ${data.cache?.connected}`);
    console.log(`   Entries: ${data.cache?.dbSize}`);
    console.log(`   Memory: ${data.cache?.memoryUsed}`);
  } catch (err) {
    console.error('❌ Cache test failed:', err.message);
  }
}

function printStats() {
  times.sort((a, b) => a - b);
  const avg = totalTime / (NUM_REQUESTS - errors);
  const median = times[Math.floor(times.length / 2)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];

  console.log('\n📈 Performance Statistics:');
  console.log(`   Requests: ${NUM_REQUESTS}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Success Rate: ${((NUM_REQUESTS - errors) / NUM_REQUESTS * 100).toFixed(1)}%`);
  console.log(`   Avg Response: ${avg.toFixed(2)}ms`);
  console.log(`   Median: ${median}ms`);
  console.log(`   Min: ${minTime}ms`);
  console.log(`   Max: ${maxTime}ms`);
  console.log(`   p95: ${p95}ms`);
  console.log(`   p99: ${p99}ms`);
  console.log(`   Total Time: ${totalTime}ms`);
}

async function run() {
  console.log('🚀 Starting Load Tests...');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Requests per test: ${NUM_REQUESTS}`);
  console.log(`   Concurrency: ${CONCURRENCY}\n`);

  try {
    await testChat();
    times.length = 0; // Reset for next test
    totalTime = 0;
    minTime = Infinity;
    maxTime = 0;
    completed = 0;

    await testVectorSearch();
    await testCache();

    printStats();

    console.log('\n✅ Load tests complete!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
