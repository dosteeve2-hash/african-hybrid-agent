# CODEX ONE-PAGER - African Hybrid Agent v0.3
## Print This & Keep On Your Desk!

---

## 🚀 YOUR MISSION (This Week)

| Task | Priority | Owner | Status |
|------|----------|-------|--------|
| Fix failing tests (36 total, target 30+) | 🔴 HIGH | YOU | Mon-Tue |
| Generate embeddings (550+ chunks) | 🔴 HIGH | YOU | Wed |
| Integrate cache (Chat + Search APIs) | 🔴 HIGH | YOU | Thu |
| Setup CI/CD pipelines | 🟡 MEDIUM | YOU | Fri |
| Final validation & docs | 🟡 MEDIUM | YOU | Fri |

**Success Criteria:** All 36 tests passing + 50%+ latency improvement with cache + Production deployment ready

---

## 📚 READING ORDER (1 Hour)

1. ✅ **CODEX_WELCOME.md** (10 min) - Motivation
2. ✅ **QUICK_START.md** (5 min) - Commands
3. ✅ **CODEX_ONBOARDING.md** (30 min) - Everything you need to know
4. ✅ **ARCHITECTURE.md** (15 min) - How it works
5. ✅ **CODEX_WEEK1_CHECKLIST.md** (reference daily)

---

## 🎯 THE STACK

```
Next.js 16.2.4 (React 19)
    ↓
PostgreSQL 15 + pgvector (embeddings)
    ↓
Redis 7 (caching)
    ↓
14 African sources + 550+ chunks
```

---

## 💻 ESSENTIAL COMMANDS

```bash
# First Run
npm run build                    # Build production
npm test -- --forceExit         # Run all tests

# Services
docker-compose -f docker-compose.postgres.yml up -d
psql -h localhost -U postgres -d african_agent
redis-cli -h localhost -p 6379

# Check Status
docker ps                        # Services running?
npm test -- --forceExit --silent # How many tests passing?
```

---

## 🎓 KEY CONCEPTS

**Vector Search:**
- TF-IDF → 1000-dim vector → pgvector → cosine similarity
- Similarity = 1 - distance (higher = more similar)

**Caching:**
- Search results: 1h TTL (by query)
- Sessions: 24h TTL (by sessionId)
- Stats: 1h TTL (predictable keys)

**Architecture:**
- API Layer → Service Layer → Database Layer
- Everything has tests
- Everything is documented

---

## 📁 FILE LOCATIONS

```
Test Files:
src/lib/rag/__tests__/
  ├─ embeddings.test.ts (13 cases)
  ├─ retrieve.test.ts (12 cases)
  └─ orchestrator.test.ts (11 cases)

Services (You'll modify):
src/lib/db/
  ├─ vectors.ts (VectorService)
  └─ services.ts (CorpusService, etc.)
src/lib/cache/
  └─ redis.ts (RedisService)

API Routes (You'll modify):
src/app/api/
  ├─ chat/route.ts
  ├─ search/vector/route.ts
  └─ cache/route.ts
```

---

## ⚡ WEEK SCHEDULE

```
MONDAY    | Setup + Assessment (4h)
TUESDAY   | Test Debugging (5h)
WEDNESDAY | Embeddings Generation (5h)
THURSDAY  | Cache Integration (5h)
FRIDAY    | Validation + CI/CD (5h)
          | TARGET: Ship v0.3 ✅
```

---

## 🆘 WHEN YOU'RE STUCK

1. **Check:** CODEX_ONBOARDING.md troubleshooting section
2. **Search:** `grep -r "what-you're-looking-for" src/`
3. **Review:** Source code comments + test files
4. **Debug:**
   ```bash
   docker ps                    # Services running?
   psql -c "SELECT 1;"         # DB working?
   redis-cli ping              # Redis working?
   ```
5. **Ask:** #development Slack or get help from team

---

## 🎁 WHAT YOU INHERIT

✅ Complete codebase (15,000+ lines)  
✅ PostgreSQL schema (10 tables, 3 views)  
✅ 36 test cases (mostly written)  
✅ 8+ API endpoints (functional)  
✅ 14 corpus sources (authentic African)  
✅ Admin dashboard (working)  
✅ Full documentation (9+ guides)  

**Your job:** Polish it + Ship it

---

## 🚀 GET STARTED NOW

```bash
cd "c:\Users\pc\Documents\New Project"
npm run build           # Should compile
npm test -- --forceExit # Should show test results
cat CODEX_WELCOME.md    # Read this first
```

---

## 📊 DAILY CHECKLIST

**Every morning:**
- [ ] Read today's tasks from CODEX_WEEK1_CHECKLIST.md
- [ ] Run tests: `npm test -- --forceExit --silent`
- [ ] Report: ✅ passing count / ❌ failing count
- [ ] Note: Any blockers or questions

**Every evening:**
- [ ] Complete end-of-day report (see checklist)
- [ ] Commit progress: `git status` review
- [ ] Plan: Tomorrow's tasks

---

## 🎉 THE PRIZE

By Friday:
- ✅ v0.3 production-ready
- ✅ 50%+ faster with cache
- ✅ All tests passing
- ✅ CI/CD automated
- ✅ Portfolio piece

**Impact:** Your code will serve millions. 🌍

---

## 📞 QUICK LINKS

| Need | Location |
|------|----------|
| Full onboarding | CODEX_ONBOARDING.md |
| This week's plan | CODEX_WEEK1_CHECKLIST.md |
| Commands | QUICK_START.md |
| Architecture | ARCHITECTURE.md |
| All docs index | CODEX_DOCS_INDEX.md |
| API examples | docs/API_REFERENCE.md |
| Corpus data | CORPUS_ENRICHMENT.md |

---

## ✨ REMEMBER

> "You have everything you need.  
> The infrastructure is done.  
> Your job: Polish, integrate, and ship.  
> Make miracles happen. 🚀"

---

**Print this page. Keep it visible. Reference it daily.**

**Ready? Let's ship v0.3! 🚀**

---

**One-Pager v1.0 | May 2025 | Ready to Print ✅**
