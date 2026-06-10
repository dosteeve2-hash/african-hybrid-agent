# 🎯 PROMPT FOR CODEX - How to Use This Onboarding

## Your Instructions as Codex

You are being onboarded to the **African Hybrid Agent v0.3** project.

**Your Role:** Complete production-ready implementation  
**Duration:** This week (Monday-Friday)  
**Team Size:** You + 1 human team lead  
**Impact:** Millions of African users

---

## 📋 YOUR ONBOARDING PROTOCOL

### Phase 1: Orient Yourself (Monday, 1-2 hours)

**Step 1: Read Quick Documents (15 minutes)**
1. Open `CODEX_BRIEFING.txt` - Get the 30-second overview
2. Open `CODEX_WELCOME.md` - Understand the vision and impact
3. Skim `QUICK_START.md` - See the essential commands

**Step 2: Setup Environment (30 minutes)**
```bash
cd "c:\Users\pc\Documents\New Project"
npm install redis --legacy-peer-deps
npm run build
npm test -- --forceExit
```

**Step 3: Verify Everything Works (15 minutes)**
- [ ] Build completes without errors
- [ ] Tests run (note: pass/fail count)
- [ ] Docker services start: `docker-compose -f docker-compose.postgres.yml up -d`
- [ ] Database accessible: `psql -h localhost -U postgres -d african_agent -c "SELECT 1;"`

**Step 4: Create Your Baseline Report**
```
BASELINE STATUS (Monday):
Build: [✅ Success / ❌ Failed with X errors]
Tests: [✅ 30+ passing / ⚠️ Only X passing]
Services: [✅ All connected / ⚠️ [List issues]]
Database: [✅ Connected / ❌ Connection failed]
Next: [Your plan for Tuesday]
```

### Phase 2: Deep Dive (Monday afternoon)

**Step 1: Read Full Onboarding (30 minutes)**
- [ ] Open `CODEX_ONBOARDING.md`
- [ ] Read sections 1-5 (Project context, Tech stack, What's built)
- [ ] Bookmark sections 6-8 (Troubleshooting, References)

**Step 2: Understand the Architecture (15 minutes)**
- [ ] Open `ARCHITECTURE.md`
- [ ] Study the ASCII diagram at top
- [ ] Read one request flow example (Chat API or Vector Search)
- [ ] Understand the layers: Client → API → Services → Database

**Step 3: Know Your Tasks (5 minutes)**
- [ ] Open `CODEX_WEEK1_CHECKLIST.md`
- [ ] Read Monday and Tuesday sections only
- [ ] Understand your objectives

**Step 4: Prepare For Tomorrow**
- Document any questions or blockers
- Identify which tests are failing
- Plan your debugging approach for Tuesday morning

---

## 🎯 HOW TO USE EACH DOCUMENT

### Daily Reference (Keep Open)
- **`CODEX_WEEK1_CHECKLIST.md`** ← Check this every morning
  - See today's tasks
  - Follow the checklist
  - Fill in end-of-day report

- **`QUICK_START.md`** ← Command reference
  - Copy/paste essential commands
  - Check if something should be running

### When You Need Context
- **`CODEX_ONBOARDING.md`** ← The Bible
  - Answer to every "why" question
  - Troubleshooting section for issues
  - Known issues and their solutions
  - Code examples and patterns

- **`ARCHITECTURE.md`** ← Understand the system
  - Data flows and request patterns
  - Database schema overview
  - Component relationships
  - Deployment model

### During Specific Tasks
- **`SESSION_V0_3_FEATURES.md`** ← While working on vector/cache
  - Vector search algorithms
  - Redis caching patterns
  - API endpoint details

- **`STATUS_FINAL.md`** ← Verify what's done
  - Confirm completed features
  - Know what's still pending

### For Data Understanding
- **`CORPUS_ENRICHMENT.md`** ← When curious about data
  - 14 sources detailed
  - Coverage and credibility info
  - Example chunks

### For Debugging
- **`docs/API_REFERENCE.md`** ← When testing endpoints
  - Exact request/response format
  - Error codes and meanings
  - Example payloads

### Navigation Help
- **`CODEX_DOCS_INDEX.md`** ← When lost
  - Quick links to all docs
  - Priority reading order
  - Task-based navigation

### Quick Reminder
- **`CODEX_ONE_PAGER.md`** ← Print this!
  - Daily reference checklist
  - Essential commands
  - When you're stuck

---

## 🔄 WEEKLY WORKFLOW

### Monday
1. Read: CODEX_BRIEFING.txt + CODEX_WELCOME.md + QUICK_START.md
2. Run: `npm run build && npm test`
3. Read: CODEX_ONBOARDING.md (sections 1-5)
4. Read: ARCHITECTURE.md
5. Action: Log baseline status

### Tuesday-Thursday
1. Morning: Check CODEX_WEEK1_CHECKLIST.md for today's tasks
2. Throughout: Reference CODEX_ONBOARDING.md as needed
3. Evening: Fill in daily report in checklist
4. Use: Specific docs (SESSION_V0_3_FEATURES.md, ARCHITECTURE.md, etc.)

### Friday
1. Complete: All checklist items
2. Validate: All tests passing
3. Document: Final status report
4. Ship: v0.3 production release

---

## 💡 USAGE PATTERNS

### Pattern 1: "I don't know what to do"
```
1. Check: CODEX_WEEK1_CHECKLIST.md (what's today's task?)
2. Read: Relevant section in CODEX_ONBOARDING.md
3. Execute: Step-by-step from checklist
4. Debug: If stuck, use troubleshooting section
```

### Pattern 2: "How does this work?"
```
1. Check: ARCHITECTURE.md (system overview)
2. Read: Relevant section in SESSION_V0_3_FEATURES.md
3. Review: Source code file for implementation
4. Test: Write a small test or try the API
```

### Pattern 3: "Something's broken"
```
1. Check: QUICK_START.md (did services start?)
2. Read: Troubleshooting in CODEX_ONBOARDING.md
3. Debug: Using provided commands
4. Ask: For help with detailed error
```

### Pattern 4: "What's done vs pending?"
```
1. Check: STATUS_FINAL.md (build status)
2. Check: CODEX_WEEK1_CHECKLIST.md (your task list)
3. Verify: With `npm test` and `npm run build`
4. Report: Daily end-of-day status
```

---

## 🎯 SUCCESS METRICS (Track Daily)

### Build Status
- [ ] `npm run build` completes without errors
- [ ] `.next/` folder populated
- [ ] No TypeScript errors

### Tests
- [ ] Run: `npm test -- --forceExit`
- [ ] Track: X/36 passing
- [ ] Goal: 30+ passing by end of week

### Features
- [ ] Monday: Understand architecture
- [ ] Tuesday: 30+ tests passing
- [ ] Wednesday: 550+ embeddings generated
- [ ] Thursday: Cache integrated
- [ ] Friday: CI/CD setup + final validation

### Performance
- [ ] Chat latency: Target <500ms
- [ ] Vector search: Target <100ms
- [ ] Cache improvement: Target >50%

---

## 📞 ASKING FOR HELP

**Before asking, check:**
1. CODEX_ONBOARDING.md troubleshooting section
2. `grep -r "your-error-message" src/`
3. Related test files for expected behavior
4. Source code comments

**When asking, provide:**
- Error message (exact copy-paste)
- What you were trying to do
- What you've already tried
- Relevant logs or output

**Escalation path:**
1. Try to solve it yourself (30 min)
2. Ask #development Slack channel
3. Pair program with team lead if needed

---

## 📊 DOCUMENTATION STATISTICS

| Document | Length | Read Time | Purpose |
|----------|--------|-----------|---------|
| CODEX_BRIEFING.txt | 30 lines | 30 sec | Hook + overview |
| QUICK_START.md | 100 lines | 5 min | Commands + quick tasks |
| CODEX_WELCOME.md | 200 lines | 10 min | Motivation + vision |
| CODEX_ONBOARDING.md | 600+ lines | 30 min | Complete reference |
| ARCHITECTURE.md | 400+ lines | 15 min | System design |
| CODEX_WEEK1_CHECKLIST.md | 500+ lines | 5 min (per day) | Daily guide |
| SESSION_V0_3_FEATURES.md | 400+ lines | 15 min | Feature details |
| CODEX_DOCS_INDEX.md | 300+ lines | 5 min | Navigation |
| CODEX_ONE_PAGER.md | 100 lines | 3 min | Quick reference |

**Total:** ~2,500 lines of documentation for your success

---

## ✨ PRO TIPS FOR SUCCESS

1. **Print CODEX_ONE_PAGER.md** - Keep on desk, reference daily
2. **Bookmark CODEX_ONBOARDING.md** - You'll use it constantly
3. **Keep CODEX_WEEK1_CHECKLIST.md open** - Your daily guide
4. **Refer to source code early** - It's well-commented
5. **Test everything as you go** - Don't wait until Friday
6. **Take notes** - Write down patterns you learn
7. **Ask questions early** - Don't get stuck in silence
8. **Celebrate wins** - Each test fixed is progress!

---

## 🚀 YOUR FIRST COMMAND SEQUENCE

```bash
# 1. Get positioned
cd "c:\Users\pc\Documents\New Project"

# 2. Read onboarding (open in your editor)
cat CODEX_BRIEFING.txt     # 30 seconds
cat CODEX_WELCOME.md       # 10 minutes
cat QUICK_START.md         # 5 minutes

# 3. Verify setup
npm run build              # Should complete
npm test -- --forceExit    # Should show results

# 4. Start Docker services
docker-compose -f docker-compose.postgres.yml up -d

# 5. Test connections
psql -h localhost -U postgres -d african_agent -c "SELECT 1;"
redis-cli -h localhost -p 6379 ping

# 6. Deep dive
# Read CODEX_ONBOARDING.md (30 min)
# Read ARCHITECTURE.md (15 min)

# 7. Get ready for tomorrow
# Plan first tasks using CODEX_WEEK1_CHECKLIST.md
```

---

## 🎉 YOU'RE READY!

You have:
- ✅ 9 comprehensive documents
- ✅ Complete codebase (15,000+ lines)
- ✅ Working infrastructure
- ✅ Clear tasks and timeline
- ✅ Reference implementations
- ✅ Team support

**Everything is prepared. Now it's up to you.**

---

## 🎯 THE ULTIMATE GOAL

By end of Friday:
- ✅ All 36 tests passing
- ✅ 550+ embeddings generated
- ✅ Cache integrated (50%+ latency improvement)
- ✅ CI/CD automated
- ✅ Production deployment ready
- ✅ Full documentation updated

**Then:** v0.3 ships to production

**Impact:** Millions of African users get authentic AI

---

**Remember:** You have everything you need.  
**Act:** Start with CODEX_BRIEFING.txt → CODEX_WELCOME.md → npm run build  
**Deliver:** v0.3 production-ready by Friday  
**Impact:** Make miracles happen 🚀

---

**Last Updated:** May 2025  
**Status:** Ready for execution ✅  
**Next:** Read CODEX_BRIEFING.txt (30 seconds) → Go!
