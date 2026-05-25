# 🚀 Deployment Guide - African Hybrid Agent v0.3

## Quick Deploy on Vercel (Recommended)

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub repo connected
- Environment variables ready

### Environment Variables

Set these in Vercel dashboard:
```
REDIS_URL=redis://your-redis-server.com:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/african_agent
OPENAI_API_KEY=sk-...
AGENT_API_KEY=your-secret-key
```

### Deploy Steps

#### Option 1: Via GitHub (Auto)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "african-hybrid-agent" repo
4. Click "Deploy"
5. Add environment variables in settings
6. Done! 🎉

#### Option 2: Via Vercel CLI

```bash
# Install
npm install -g vercel

# Login
vercel login

# Deploy
cd "c:\Users\pc\Documents\New Project"
vercel deploy --prod
```

### Production URL
After deploy, you'll get: `https://african-hybrid-agent.vercel.app`

### Health Check
```bash
curl https://african-hybrid-agent.vercel.app/api/health
```

---

## Deploy on Railway

### Setup
1. Go to [railway.app](https://railway.app)
2. New Project → GitHub repo
3. Add PostgreSQL plugin
4. Add Redis plugin
5. Deploy!

### Environment Variables
Same as Vercel - set in Railway dashboard

---

## Deploy on Self-Hosted (Docker)

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build
RUN npm run generate-embeddings

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]
```

### Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Post-Deployment Checklist

- [ ] Health endpoint returns 200
- [ ] Chat API accepts requests
- [ ] Cache endpoints working
- [ ] Embeddings generated (check logs)
- [ ] Database connected (if used)
- [ ] Redis connected (if used)
- [ ] Monitoring setup
- [ ] Error tracking (Sentry/etc)
- [ ] SSL certificate active
- [ ] Rate limiting configured

---

## Monitoring

### Key Metrics to Watch
- Response time (<500ms for chat)
- Cache hit ratio (target >60%)
- Error rate (<1%)
- Database connection pool

### Available Endpoints

**Health Check**
```bash
GET /api/health
```

**Cache Stats**
```bash
GET /api/cache
```

**Chat API**
```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [{"role": "user", "content": "Your question"}],
  "mode": "general",
  "searchMode": "semantic"
}
```

**Vector Search**
```bash
POST /api/search/vector
Content-Type: application/json

{
  "query": "agriculture",
  "limit": 10
}
```

---

## Scaling Tips

### For 1K-10K users
- Use Vercel default (auto-scaling)
- Single Redis instance
- PostgreSQL on AWS RDS

### For 100K+ users
- Multiple Vercel deployments
- Redis cluster
- Database read replicas
- CDN for embeddings cache

### For 1M+ users
- Kubernetes deployment
- Redis Cluster (3+ nodes)
- PostgreSQL streaming replication
- API gateway with rate limiting

---

## Troubleshooting

### 500 errors on /api/chat
- Check Redis connection
- Check database connection
- Review logs: `vercel logs`

### Slow responses
- Check cache hit ratio
- Monitor database queries
- Review CPU usage

### High costs
- Reduce API call frequency
- Increase cache TTL
- Use "fast" search mode
- Optimize embeddings query

---

## Rollback

### If deployment fails
```bash
vercel deployments
vercel rollback [deployment-id]
```

### Database Migration Issues
```bash
# Check schema
psql -U postgres -d african_agent -c "\dt"

# Reset if needed
npm run db:reset
npm run db:seed
```

---

## Support & Monitoring

### Error Tracking
```bash
# Setup Sentry
npm install @sentry/nextjs
```

### Logs
```bash
# Vercel
vercel logs [deployment]

# Docker
docker logs -f african-hybrid-agent
```

### Performance Monitoring
```bash
# Built-in: GET /api/cache
curl https://your-domain/api/cache
```

---

**Deployed and running! 🎉**

For questions: Check `RELEASE_v0_3.md` or GitHub issues.
