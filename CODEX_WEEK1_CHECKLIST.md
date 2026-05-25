# ✅ CODEX Week 1 Checklist - African Hybrid Agent v0.3

**Objective:** Transition from v0.3 feature phase to production-ready system  
**Timeline:** This week (Monday-Friday)  
**Success Metric:** All 36 tests passing + embeddings generated + cache integrated

---

## 📋 Monday - Onboarding & Assessment

### ☐ Onboarding (2 hours)
- [ ] Read CODEX_BRIEFING.txt (5 min)
- [ ] Read QUICK_START.md (5 min)
- [ ] Skim CODEX_ONBOARDING.md (10 min)
- [ ] Review ARCHITECTURE.md (10 min)
- [ ] Review SESSION_V0_3_FEATURES.md (10 min)

### ☐ Environment Setup (1 hour)
- [ ] Clone repository: `cd "c:\Users\pc\Documents\New Project"`
- [ ] Install dependencies: `npm install redis --legacy-peer-deps`
- [ ] Create `.env.local` with credentials
- [ ] Verify Node.js version: `node --version` (should be v18+)

### ☐ Initial Assessment (1 hour)
- [ ] Run build: `npm run build`
  - [ ] Record result (success/failed)
  - [ ] Note any TypeScript errors
- [ ] Check build artifacts: `dir .next\static`
- [ ] Run tests: `npm test -- --forceExit --silent`
  - [ ] Record: Total tests, passing count, failing count
  - [ ] Save output: `npm test -- --forceExit 2>&1 > test_results_baseline.txt`

### ☐ Infrastructure Check (1 hour)
- [ ] Start Docker services: `docker-compose -f docker-compose.postgres.yml up -d`
- [ ] Verify PostgreSQL: `psql -h localhost -U postgres -d african_agent -c "SELECT 1;"`
- [ ] Verify Redis: `redis-cli -h localhost -p 6379 ping`
- [ ] Check database schema: `psql -h localhost -U postgres -d african_agent -c "\dt"`
  - [ ] Verify 10 tables exist
  - [ ] Record table names

### 📝 End of Day Report
```
Build:
  Status: [Success/Failed]
  Errors: [List or None]

Tests:
  Total: [#]
  Passing: [#]
  Failing: [#]

Services:
  PostgreSQL: [Connected/Failed]
  Redis: [Connected/Failed]

Next: [Your next steps]
```

---

## 📋 Tuesday - Test Debugging & Fixing

### ☐ Analyze Test Failures (2 hours)
- [ ] Run tests with verbose output: `npm test -- --forceExit --verbose 2>&1 | tee test_verbose.txt`
- [ ] Identify failing tests (count by suite):
  - [ ] embeddings.test.ts: __ passing, __ failing
  - [ ] retrieve.test.ts: __ passing, __ failing
  - [ ] orchestrator.test.ts: __ passing, __ failing
- [ ] Categorize failures:
  - [ ] Type errors (casting/structure)
  - [ ] Data assertion errors (values don't match)
  - [ ] Connection errors (DB/Redis unavailable)
  - [ ] Other: [describe]

### ☐ Fix Type/Assertion Issues (2 hours)
- [ ] Review failing test file line by line
- [ ] For each failure:
  - [ ] Understand what test expects
  - [ ] Check actual implementation returns
  - [ ] Update test OR fix implementation
- [ ] Possible fixes:
  - [ ] Update assertions to match actual data types
  - [ ] Fix mock data structures
  - [ ] Update imports/dependencies

### ☐ Fix Connection Issues (1 hour)
- [ ] Verify Docker containers running: `docker-compose -f docker-compose.postgres.yml ps`
- [ ] If PostgreSQL failing:
  - [ ] Restart: `docker-compose -f docker-compose.postgres.yml restart postgres`
  - [ ] Check logs: `docker logs -f postgres`
- [ ] If Redis failing:
  - [ ] Restart: `docker-compose -f docker-compose.postgres.yml restart redis`
  - [ ] Check logs: `docker logs -f redis`

### ☐ Rerun Tests (30 min)
- [ ] After fixes: `npm test -- --forceExit --silent`
- [ ] Compare to baseline:
  - [ ] Passing count: [baseline] → [current]
  - [ ] Failing count: [baseline] → [current]
  - [ ] Target: 30+ passing

### 📝 End of Day Report
```
Test Fixes Applied:
1. [Issue] → [Solution] ✅/❌
2. [Issue] → [Solution] ✅/❌

Status:
  Before: X passing, Y failing
  After: X passing, Y failing
  Improvement: +Z tests fixed

Blockers: [List any remaining issues]
Next: [Focus for Wednesday]
```

---

## 📋 Wednesday - Embeddings Generation

### ☐ Understand Embedding Architecture (1 hour)
- [ ] Read `src/lib/db/vectors.ts` (VectorService class)
- [ ] Read `src/lib/rag/embeddings.ts` (TF-IDF implementation)
- [ ] Understand: TF-IDF → vector (1000 dimensions) → pgvector storage
- [ ] Check: `buildTFIDFVector(text, corpus)` signature

### ☐ Create Batch Generation Script (2 hours)
**Create file:** `scripts/generate-embeddings.js`

```javascript
// Pseudocode structure:
1. Load corpus data from filesystem
2. For each corpus chunk:
   a. Generate TF-IDF vector using buildTFIDFVector()
   b. Call VectorService.storeEmbedding(chunkId, vector)
   c. Log progress: "Generated 1/550 embeddings..."
3. Report: "✅ Generated 550 embeddings in 2.5 seconds"

// Key considerations:
- Batch size: Process 50 at a time to avoid memory overflow
- Error handling: If one fails, log but continue
- Transaction support: Use storeEmbeddingsBatch() if available
- Performance: Target < 5 seconds for all 550
```

### ☐ Test Embedding Generation (1 hour)
- [ ] Verify script can connect to PostgreSQL
- [ ] Test with small subset: `npm run generate-embeddings -- --limit=10`
  - [ ] Check output: "Generated 10/10 embeddings"
- [ ] Verify embeddings stored: `psql -c "SELECT COUNT(*) FROM chunk_embeddings;"`

### ☐ Generate Full Embeddings (1 hour)
- [ ] Run full batch: `npm run generate-embeddings`
  - [ ] Watch progress log
  - [ ] Target: All 550+ generated in < 5 seconds
- [ ] Verify complete: `psql -c "SELECT COUNT(*) FROM chunk_embeddings;"`
  - [ ] Expected: ~550 entries
- [ ] Spot check: 
  ```sql
  SELECT chunk_id, model, array_length(embedding, 1) as dimensions
  FROM chunk_embeddings 
  LIMIT 5;
  ```

### ☐ Test Vector Search (30 min)
- [ ] Test API endpoint: `curl -X POST http://localhost:3000/api/search/vector -H "Content-Type: application/json" -d '{"query":"agriculture","limit":5}'`
- [ ] Expected response: `{ resultCount: 5, results: [...], mode: "semantic" }`
- [ ] Check similarity scores: All between 0 and 1

### 📝 End of Day Report
```
Embeddings Generation:
  ✅ Script created: scripts/generate-embeddings.js
  ✅ Tested with 10 chunks: [Success/Failed]
  ✅ Generated full 550: [Success/Failed]
  
Database Verification:
  Total embeddings: [#]
  Average dimensions: [#]
  Spot check: [Sample results]

Vector Search Test:
  Endpoint response: [Success/Failed]
  Sample results: [Show 1-2]

Next: Cache integration
```

---

## 📋 Thursday - Cache Integration

### ☐ Cache Integration in Chat API (2 hours)
**File to modify:** `src/app/api/chat/route.ts`

```typescript
// Add imports
import { cacheSessionData, getCachedSearchResults } from '@/lib/cache/redis';

// In POST handler:
1. Before DB query: Check if session cached
   const cachedSession = await getCachedSearchResults(sessionId);
   if (cachedSession) return cachedSession;

2. After generating response:
   await cacheSessionData(sessionId, response, 86400); // 24 hours

3. Test: Make 2 identical requests, measure time difference
```

### ☐ Cache Integration in Vector Search API (2 hours)
**File to modify:** `src/app/api/search/vector/route.ts`

```typescript
// Add imports
import { cacheSearchResults, getCachedSearchResults } from '@/lib/cache/redis';

// In POST handler:
1. Check cache: const cached = await getCachedSearchResults(query);
2. If hit: return cached; (should be <10ms)
3. If miss: Generate results (100ms+)
4. Store: await cacheSearchResults(query, results, 3600); // 1 hour
5. Return results
```

### ☐ Initialize Redis on Server Startup (1 hour)
**Options:**
- [ ] Option A: In `/api/health` endpoint:
  ```typescript
  import { initializeRedis } from '@/lib/cache/redis';
  export async function GET() {
    await initializeRedis();
    return { redis: 'initialized' };
  }
  ```
- [ ] Option B: In Next.js middleware (preferred)
  ```typescript
  // middleware.ts
  import { initializeRedis } from '@/lib/cache/redis';
  initializeRedis().catch(console.error);
  ```

### ☐ Test Cache Performance (1 hour)
- [ ] Chat API cache test:
  ```bash
  # First call (cache miss): Record time
  curl -X POST http://localhost:3000/api/chat ... > /time /T
  
  # Second call (cache hit): Record time
  curl -X POST http://localhost:3000/api/chat ... > /time /T
  
  # Expected: 2nd call 50%+ faster
  ```

- [ ] Vector search cache test:
  ```bash
  # First search (miss): Record time
  curl -X POST http://localhost:3000/api/search/vector -d '{"query":"agriculture"}'
  
  # Second search (hit): Record time
  curl -X POST http://localhost:3000/api/search/vector -d '{"query":"agriculture"}'
  
  # Expected: Cache hit < 10ms
  ```

- [ ] Monitor cache stats:
  ```bash
  curl http://localhost:3000/api/cache
  # Should show: dbSize > 0, connected: true
  ```

### 📝 End of Day Report
```
Cache Integration:
  ✅ Chat API: Modified to use cache
  ✅ Vector search API: Modified to use cache
  ✅ Redis initialization: [Done/Pending]

Performance Improvements:
  Chat API:
    Miss: __ms → Hit: __ms (___% faster)
  Vector search:
    Miss: __ms → Hit: __ms (___% faster)

Cache Stats:
  Entries in cache: __
  Memory used: __MB
  Hit ratio (estimated): __%

Next: Final validation & CI/CD
```

---

## 📋 Friday - Final Validation & CI/CD Setup

### ☐ Run Full Test Suite (1 hour)
- [ ] `npm test -- --forceExit`
- [ ] Expected result:
  - [ ] 36 tests total
  - [ ] 30+ passing
  - [ ] 0-5 failing (acceptable, document any knowns)
- [ ] If failures remain:
  - [ ] Document: Which tests failing + why
  - [ ] Propose: Fix or known limitation

### ☐ Performance Validation (1 hour)
- [ ] Build production bundle:
  ```bash
  npm run build
  # Expected: "✓ Compiled successfully"
  ```
- [ ] Check bundle size: `npm run build 2>&1 | grep -i "size"`
- [ ] Verify no new errors introduced

### ☐ Setup CI/CD Pipeline (2 hours)
**Create file:** `.github/workflows/test.yml`

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --forceExit --coverage
      - run: npm run build
```

**Create file:** `.github/workflows/build.yml`

```yaml
name: Build Production
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: yourregistry/african-agent:latest
```

### ☐ Create Deployment Guide (1 hour)
**Create file:** `docs/DEPLOYMENT.md`

Include:
- [ ] Production environment variables
- [ ] Database initialization steps
- [ ] Redis setup
- [ ] Performance tuning
- [ ] Monitoring setup
- [ ] Rollback procedures

### ☐ Final Documentation (1 hour)
- [ ] Update `README.md` with new features
- [ ] Update `ARCHITECTURE.md` with deployment info
- [ ] Create `TROUBLESHOOTING.md` with common issues
- [ ] Add `PERFORMANCE.md` with benchmarks

### 📝 End of Week Report
```
✅ COMPLETION STATUS:

Tests:
  [#]/36 passing ✅
  [#]/36 failing ⚠️

Performance:
  Chat latency: __ms (target <500ms)
  Vector search: __ms (target <100ms)
  Cache improvement: __%+

Infrastructure:
  ✅ PostgreSQL + embeddings
  ✅ Redis caching
  ✅ CI/CD pipeline
  ✅ Documentation

Issues Remaining:
  [List any known issues or limitations]

Next Week:
  - [ ] E2E integration tests
  - [ ] Performance optimization
  - [ ] Production deployment
  - [ ] Monitoring setup

READY FOR v0.3 PRODUCTION RELEASE: [YES/NO]
```

---

## 🎯 Success Criteria by End of Week

| Criteria | Target | Actual | Status |
|----------|--------|--------|--------|
| Tests Passing | 30+ / 36 | __ / 36 | __ |
| Build Status | 0 errors | __ errors | __ |
| Embeddings Generated | 550+ | __ | __ |
| Cache Hit Ratio | >60% | __% | __ |
| Chat Latency | <500ms | __ms | __ |
| Vector Search | <100ms | __ms | __ |
| Database Connected | ✅ | __ | __ |
| Redis Connected | ✅ | __ | __ |
| CI/CD Pipelines | 2 workflows | __ | __ |
| Documentation | Complete | __% | __ |

---

## 🚀 Daily Standup Template (For Team)

**Every morning at 10 AM:**

```
YESTERDAY:
- ✅ Completed: [What you did]
- 🔄 In Progress: [Current task]
- 🚫 Blocked: [Any blockers]

TODAY'S PLAN:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

SUPPORT NEEDED:
- [Any help requests?]

TIME LOG:
- Hours worked: __
- Estimated to completion: __
```

---

## 📞 Getting Unstuck

**If you get stuck:**

1. **Check documentation:**
   - CODEX_ONBOARDING.md (look up "section X")
   - ARCHITECTURE.md (understand data flow)
   - src/ files have inline comments

2. **Debug systematically:**
   ```bash
   # Check service running
   docker ps
   
   # Check service logs
   docker logs -f postgres  # or redis
   
   # Test connection
   psql -h localhost -U postgres -d african_agent -c "SELECT 1;"
   redis-cli ping
   
   # Check env vars
   cat .env.local
   ```

3. **Search codebase:**
   ```bash
   grep -r "VectorService" src/  # Find all usages
   grep -r "cacheSessionData" src/  # Find all usages
   ```

4. **Ask for help:**
   - Slack: #development
   - Include: Error message, steps to reproduce, what you've tried

---

## 🎁 Resources Provided

- ✅ CODEX_BRIEFING.txt - 30 second overview
- ✅ QUICK_START.md - 5 minute guide
- ✅ CODEX_ONBOARDING.md - Complete context
- ✅ ARCHITECTURE.md - System design
- ✅ SESSION_V0_3_FEATURES.md - What we built
- ✅ STATUS_FINAL.md - Build status
- ✅ This checklist - Your week plan
- ✅ Test files - Reference implementations
- ✅ API route files - Reference implementations
- ✅ Service layer code - Business logic

---

**You have everything you need. Let's ship v0.3! 🚀**

---

**Checklist Version:** 1.0  
**Duration:** 1 week (Monday-Friday)  
**Target Completion:** End of Friday  
**Success Metric:** All items ✅ + 30+ tests passing + Ready for production
