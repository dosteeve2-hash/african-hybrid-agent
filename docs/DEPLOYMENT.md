# 📦 Deployment Guide - African Hybrid Agent v0.3

## Quick Start

```bash
# Local development with Docker
docker-compose -f docker-compose.postgres.yml up -d
npm install
npm run dev

# Production with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Setup

### Local Development (.env.local)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres_password
DB_NAME=african_agent
DB_SSL=false

# Admin
ADMIN_API_KEY=dev-admin-key

# Optional: LLM
OPENAI_API_KEY=sk-...
```

### Production Environment

```env
NODE_ENV=production
DB_HOST=prod-postgres.db.internal
DB_PORT=5432
DB_USER=db_user
DB_PASSWORD=***
DB_NAME=african_agent
DB_SSL=true
ADMIN_API_KEY=***
REDIS_URL=redis://redis:6379
```

## Database Setup

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose -f docker-compose.postgres.yml up -d

# Verify services
docker-compose ps

# Connect to database
psql postgresql://postgres:postgres@localhost:5432/african_agent
```

### Option 2: Manual PostgreSQL

```bash
# Create database
createdb -h localhost -U postgres african_agent

# Run migrations
psql -h localhost -U postgres -d african_agent -f db/migrations/001_initial_schema.sql

# Verify
psql -h localhost -U postgres -d african_agent -c "\dt"
```

## API Integration

### Chat Endpoint (with persistence)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Question?"}],
    "mode": "research",
    "searchMode": "semantic",
    "boostRegion": "BF"
  }'
```

Response includes `sessionId` for session continuation.

### Admin Corpus API

```bash
# List corpus
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  http://localhost:3000/api/admin/corpus

# Add source
curl -X POST -H "Authorization: Bearer $ADMIN_API_KEY" \
  http://localhost:3000/api/admin/corpus \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"title": "...", ...},
    "chunks": [...]
  }'

# Delete source
curl -X DELETE -H "Authorization: Bearer $ADMIN_API_KEY" \
  "http://localhost:3000/api/admin/corpus?sourceId=uuid"
```

## Deployment Options

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  agent:
    build: .
    container_name: agent-africain
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      AGENT_API_KEY: ${AGENT_API_KEY}
    volumes:
      - ./data/corpus:/app/data/corpus
      - ./logs:/app/logs
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:latest
    container_name: agent-africain-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - agent
    restart: always
```

### nginx.conf

```nginx
upstream agent {
  server agent:3000;
}

server {
  listen 80;
  server_name api.project.africa;
  
  location / {
    proxy_pass http://agent;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }

  location /api/audit {
    deny all;  # Audit logs pas en production
    return 403;
  }
}

server {
  listen 443 ssl http2;
  server_name api.project.africa;

  ssl_certificate /etc/nginx/certs/cert.pem;
  ssl_certificate_key /etc/nginx/certs/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  location / {
    proxy_pass http://agent;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Lancer

```bash
# Créer fichier .env
echo "OPENAI_API_KEY=sk-..." > .env
echo "AGENT_API_KEY=$(openssl rand -hex 32)" >> .env

# Déployer
docker-compose up -d

# Logs
docker-compose logs -f agent
```

## 4. Déploiement sur Vercel

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "OPENAI_API_KEY": "@openai_api_key",
    "AGENT_API_KEY": "@agent_api_key",
    "NODE_ENV": "production"
  },
  "functions": {
    "src/app/api/chat/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/evidence/route.ts": {
      "maxDuration": 25
    }
  }
}
```

### Limites Vercel

- ⚠️ Corpus limité à ~50 sources (limite mémoire)
- ⚠️ Pas de persistence entre appels (corpus reloadé chaque fois)
- ⚠️ Timeout max 30 secondes (plans pro)

**Recommandation**: Pour production importante, utiliser Docker self-hosted.

## 5. Déploiement Railway.app

```bash
# Installer CLI
npm install -g railway

# Login
railway login

# Déployer
railway up

# Définir env variables
railway variables set OPENAI_API_KEY=sk-...
railway variables set AGENT_API_KEY=secret-key
railway variables set NODE_ENV=production
```

## 6. Monitoring et maintenance

### Health checks

```bash
# Vérifier santé service
curl -s http://localhost:3000/api/health | jq

# Monitorer corpus
curl -s http://localhost:3000/api/corpus | jq '.totalChunks'
```

### Logs (développement)

```bash
# Récupérer logs audit (max 100 derniers)
curl -s http://localhost:3000/api/audit?lastN=100 | jq
```

### Backups corpus

```bash
# Sauvegarder corpus
tar czf corpus-backup-$(date +%Y%m%d).tar.gz data/corpus/

# Restaurer
tar xzf corpus-backup-20260511.tar.gz
```

## 7. Performance et scaling

### Optimisations

1. **Cache corpus en mémoire**: Pré-chargé au démarrage (voir `corpus.ts`)
2. **Recherche sémantique optimisée**: TF-IDF pré-calculé
3. **Connection pooling LLM**: Réutiliser connexion HTTP

### Scaling horizontal

```yaml
# docker-compose avec 3 instances
services:
  agent-1:
    build: .
    environment:
      NODE_ENV: production
  agent-2:
    build: .
    environment:
      NODE_ENV: production
  agent-3:
    build: .
    environment:
      NODE_ENV: production

  nginx:
    image: nginx:latest
    volumes:
      - ./nginx-load-balancer.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
```

### nginx-load-balancer.conf

```nginx
upstream agents {
  server agent-1:3000;
  server agent-2:3000;
  server agent-3:3000;
}

server {
  listen 80;
  location / {
    proxy_pass http://agents;
  }
}
```

## 8. Sécurité en production

### Checklist

- ✅ `AGENT_API_KEY` défini → `/api/evidence` protégé par Bearer token
- ✅ Audit logs désactivés: `NODE_ENV=production` → `/api/audit` retourne 403
- ✅ CORS restrictif si frontend tiers
- ✅ Rate limiting sur `/api/chat` (expensive en LLM)
- ✅ Certificat SSL/TLS valide
- ✅ Pas de secrets dans git (utiliser `.env.local`)

### Rate limiting (example)

```typescript
// src/app/api/middleware.ts
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requêtes par minute
});

export async function POST(request: Request) {
  await limiter(request);
  // ... rest
}
```

## 9. Mise à jour du corpus

### Ajouter sources

```bash
# Copier nouveau fichier dans corpus
cp source-nouvelle.md data/corpus/

# Service recharge automatiquement au prochain appel
# (voir clearCorpusCache() dans corpus.ts)
```

### Format source

```markdown
---
title: "Titre complet source"
sourceType: "government|ngo|community|reference|product"
region: "BF|ML|SN|..."
credibilityTier: "official|high|medium|low"
---

# Contenu...

Source fiable validée localement.
```

## 10. Troubleshooting

### ❌ "OutOfMemory" avec gros corpus

**Solution**: 
- Réduire nombre sources
- Utiliser recherche "fast" par défaut
- Déployer sur machine plus puissante

### ❌ Corpus pas reloadé après ajout sources

**Solution**:
```bash
# Redémarrer service
docker-compose restart agent

# Ou manuellement
rm src/lib/rag/corpus-cache.json
```

### ❌ API lente (>5s)

**Solution**:
- Vérifier LLM (peut être bottleneck)
- Reduire `maxCitations` (défaut 6)
- Utiliser `searchMode: "fast"`

---

## Roadmap futures versions

- [ ] PostgreSQL persistent + full-text search
- [ ] Cache Redis pour sessions
- [ ] Web scraper pour actualisation corpus
- [ ] PDF upload + OCR
- [ ] Webhooks pour intégrations P2P
- [ ] Dashboard admin corpus
- [ ] Multi-language (mooré, dioula)
