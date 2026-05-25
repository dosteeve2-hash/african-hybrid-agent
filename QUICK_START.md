# ⚡ CODEX Quick Start - 5 Minute Onboarding
# Welcome to the African Hybrid Agent team! 🚀

## 🎯 Your First 5 Minutes

### 1️⃣ Clone & Navigate (1 min)
cd "c:\Users\pc\Documents\New Project"

### 2️⃣ Check Build Status (1 min)
npm run build 2>&1 | findstr "error\|Error\|successfully"
# Expected: No errors, "successfully" message

### 3️⃣ Run Tests (1 min)
npm test -- --forceExit --silent
# Expected: 30+ tests passing (out of 36)

### 4️⃣ Understand What You're Looking At (2 min)
# The stack:
# Next.js 16.2.4 (React 19) ↓ PostgreSQL 15 + pgvector ↓ Redis 7 ↓ 14 African corpus sources

## 🔨 Your Immediate Tasks (Priority Order)

### Task 1: Validate Tests (5 min)
npm test -- --forceExit 2>&1 > test_run.txt
# Success: All tests passing or only minor fixes needed

### Task 2: Check Build (5 min)
npm run build
dir .next\static
# Success: .next/ folder populated with no TS errors

### Task 3: Start Services (5 min)
docker-compose -f docker-compose.postgres.yml up -d
# Verify:
psql -h localhost -U postgres -d african_agent -c "SELECT version();"
redis-cli -h localhost -p 6379 ping

## 📊 What You're Inheriting

✅ 14 African corpus sources (550+ chunks, zero Western bias)
✅ PostgreSQL schema (10 tables, 3 views, indexes)
✅ Chat API with session persistence
✅ Admin dashboard with statistics
✅ Vector search service (pgvector layer)
✅ Redis caching layer (11 functions)
✅ 36 comprehensive Jest tests
✅ Monitoring dashboard
✅ Authentication & audit logging
✅ Docker Compose infrastructure

⏳ Your Next Wins:
[ ] Fix remaining test failures
[ ] Generate embeddings for all corpus chunks
[ ] Integrate cache into existing APIs
[ ] Setup CI/CD pipeline
[ ] E2E testing
[ ] Performance optimization

## 🎯 Key Commands

npm run dev              # Start dev server (port 3000)
npm run build            # Compile production (Turbopack)
npm test -- --forceExit # Run all 36 tests
npm run lint             # ESLint validation

## 📞 Documentation

1. STATUS_FINAL.md           # What's done
2. CODEX_ONBOARDING.md       # Full context (READ THIS FIRST!)
3. SESSION_V0_3_FEATURES.md  # This week's work
4. README.md                 # User guide
5. docs/API_REFERENCE.md     # Endpoint docs

## 🎉 You're Ready!

Start with:
npm run build
npm test -- --forceExit

Welcome to the team, Codex! 🚀

# 3. Chat mode recherche (rigoureux)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Quels sont les défis agriculture Burkina?" }
    ],
    "mode": "research",
    "searchMode": "semantic",
    "boostRegion": "BF",
    "maxCitations": 8
  }' | jq

# 4. Evidence Pack (requête libre)
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "query": "entrepreneuriat femmes secteur transformation alimentaire",
    "searchMode": "semantic",
    "maxItems": 8
  }' | jq

# 5. Evidence Pack (profil P2P)
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "recommendationProfile": {
      "country": "Burkina Faso",
      "region": "Ouagadougou",
      "preferredSector": "agriculture",
      "skills": ["vente", "organisation"],
      "observedProblem": "Jeunes competents, pas de cadrage projet",
      "constraints": "Budget faible"
    },
    "maxItems": 8,
    "boostRegion": "BF"
  }' | jq

# 6. Audit corpus
curl http://localhost:3000/api/corpus | jq

# 7. Audit logs (dev only)
curl "http://localhost:3000/api/audit?lastN=20&level=info" | jq

# 8. Avec API key (si AGENT_API_KEY défini)
curl -X POST http://localhost:3000/api/evidence \
  -H "Authorization: Bearer test-key-123" \
  -H "Content-Type: application/json" \
  -d '{"query": "agricultureafriquebf"}' | jq


## 📚 AJOUTER SOURCES

# Créer nouvelle source corpus
cat > data/corpus/exemple-source.md << 'EOF'
---
title: "Titre de la source"
sourceType: "ngo"
region: "BF"
credibilityTier: "high"
---

# Contenu

Votre contenu ici...
EOF

# Service recharge automatiquement à la prochaine requête


## 🔧 MAINTENANCE

# Linter
npm run lint

# Check types
npx tsc --noEmit

# Clean build
rm -rf .next
npm run build

# Logs (dev)
tail -f logs/audit.log

# Backup corpus
tar czf corpus-backup-$(date +%Y%m%d).tar.gz data/corpus/


## 📊 MONITORING

# Santé continue
watch -n 5 'curl -s http://localhost:3000/api/health | jq'

# Statistiques corpus
curl -s http://localhost:3000/api/corpus | jq '.sources[] | {title, sourceType, region, chunks}'

# Logs audit (last 50)
curl -s "http://localhost:3000/api/audit?lastN=50" | jq '.logs[] | {timestamp, component, level, action}'


## 🐳 DOCKER

# Build image
docker build -t agent-africain:latest .

# Run container
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... agent-africain:latest

# Docker Compose
docker-compose up -d          # Start
docker-compose logs -f        # Logs
docker-compose down           # Stop
docker-compose restart agent  # Restart service


## 📱 DÉPLOIEMENT

# Vercel
vercel deploy

# Railway
railway up

# Manual server (Ubuntu)
git clone <repo>
cd agent-africain
npm ci
npm run build
pm2 start "npm start" --name "agent"


## 💡 EXEMPLES D'USAGE

# JavaScript/TypeScript Client
const response = await fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "Comment faire?" }
    ],
    mode: "general"
  })
});
const data = await response.json();
console.log(data.reply);
console.log(`Confiance: ${(data.confidence * 100).toFixed(0)}%`);
data.citations.forEach(c => console.log(`- ${c.title}`));

# Python Client
import requests
resp = requests.post("http://localhost:3000/api/chat", json={
    "messages": [{"role": "user", "content": "Quoi?"}],
    "mode": "general"
})
print(resp.json()["reply"])

# cURL avec jq (filter JSON)
curl -s http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -d '{"query":"entrepreneuriat"}' \
  | jq '.items[] | {label, reliabilityScore, tags}'


## 🆘 TROUBLESHOOTING

# Build fail: "Out of memory"
NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Port 3000 en usage
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Corpus cache pas à jour
rm -rf .next
npm run build

# API slow
# → Vérifier OPENAI_API_KEY (LLM peut être bottleneck)
# → Utiliser searchMode: "fast"
# → Réduire maxCitations

# TypeScript errors
npx tsc --diagnostics
npx tsc --strict --noEmit


## 📝 NOTES

- En production: AGENT_API_KEY + NODE_ENV=production
- Audit logs: Désactivés en production (returns 403)
- Corpus: Recharge auto, no restart needed
- LLM: Optional, works without OPENAI_API_KEY
- Search: "semantic" par défaut, "fast" pour urgence
- Region codes: BF, ML, SN, CI, GH, NG, CM, KE, UG, RW, TZ, ET, ZA
