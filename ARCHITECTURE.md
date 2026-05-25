# 🏗️ System Architecture - African Hybrid Agent v0.3

```
┌─────────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  • User Chat Interface (/corpus)                               │
│  • Admin Dashboard (/admin) - CRUD operations                  │
│  • Monitoring Dashboard (/monitoring) - Real-time stats        │
│  • Corpus Viewer - Browse sources                              │
│                                                                 │
└────────────────────┬──────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │
┌────────────────────▼──────────────────────────────────────────┐
│         API LAYER (Next.js 16.2.4 + TypeScript)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST   /api/chat                → Chat sessions              │
│  POST   /api/search/vector       → Vector similarity search   │
│  GET    /api/search/vector/stats → Vector statistics          │
│  GET    /api/cache               → Cache stats                │
│  DELETE /api/cache               → Cache management           │
│  GET    /api/admin/corpus        → List sources               │
│  POST   /api/admin/corpus        → Create source              │
│  DELETE /api/admin/corpus        → Delete source              │
│  GET    /api/health              → Health check               │
│  GET    /api/audit               → Audit logs                 │
│                                                                 │
└────────┬──────────────────────────────────────────────────────┘
         │ Request routing
         │
┌────────▼──────────────────────────────────────────────────────┐
│      SERVICE LAYER (Business Logic + Type Safety)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                          │
│  │ ChatService     │ Sessions, Messages, History              │
│  └─────────────────┘                                          │
│                                                                 │
│  ┌─────────────────┐                                          │
│  │ CorpusService   │ Sources, Chunks, Metadata                │
│  └─────────────────┘                                          │
│                                                                 │
│  ┌─────────────────┐                                          │
│  │ VectorService   │ Embeddings, Similarity Search            │
│  └─────────────────┘                                          │
│                                                                 │
│  ┌─────────────────┐                                          │
│  │ AuditService    │ Logging, Compliance                      │
│  └─────────────────┘                                          │
│                                                                 │
│  ┌─────────────────┐                                          │
│  │ RedisService    │ Caching (Sessions, Search, Stats)        │
│  └─────────────────┘                                          │
│                                                                 │
│  ┌─────────────────────────────────┐                          │
│  │ RAG Layer:                      │                          │
│  │  • TF-IDF Embeddings            │                          │
│  │  • Semantic Retrieval           │                          │
│  │  • Geographic Boosting          │                          │
│  │  • Credibility Scoring          │                          │
│  └─────────────────────────────────┘                          │
│                                                                 │
│  ┌─────────────────────────────────┐                          │
│  │ Agent Orchestrator:             │                          │
│  │  • Query → Profile Matching     │                          │
│  │  • Research Mode vs General     │                          │
│  │  • Evidence Pack Builder        │                          │
│  └─────────────────────────────────┘                          │
│                                                                 │
└────────┬──────────────────────────────────────────────────────┘
         │ Database queries
         │ (Connection pooling: 2-10 connections, 30s timeout)
         │
┌────────▼──────────────────────────────────────────────────────┐
│    DATABASE LAYER (PostgreSQL 15 + pgvector)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CORE TABLES:                       VECTORS:                   │
│  ├─ corpus_sources                  ├─ chunk_embeddings       │
│  ├─ corpus_chunks                   │  (pgvector, 1000-dim)  │
│  ├─ chat_sessions                   │                        │
│  ├─ chat_messages                   │ SEARCH:                │
│  ├─ audit_logs                      ├─ Full-text (French)   │
│  ├─ evidence_packs                  ├─ Cosine similarity    │
│  ├─ p2p_profiles                    ├─ Hybrid search        │
│  └─ api_usage_stats                 └─ Geographic boost     │
│                                                                 │
│  ANALYTICAL VIEWS:                                            │
│  ├─ corpus_coverage_by_region                                 │
│  ├─ recent_audit_activity                                     │
│  └─ session_statistics                                        │
│                                                                 │
│  INDEXES:                                                      │
│  ├─ idx_corpus_chunks_text_fts (Full-text search)             │
│  ├─ idx_chunk_embeddings_embedding (pgvector cosine)          │
│  ├─ idx_messages_session_id (Chat lookup)                     │
│  └─ idx_audit_component_level (Audit filtering)               │
│                                                                 │
└────────┬──────────────────────────────────────────────────────┘
         │
         │ Connection pooling + Transaction support
         │
┌────────▼──────────────────────────────────────────────────────┐
│         CACHE LAYER (Redis 7 - Distributed)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CACHE NAMESPACES:                                            │
│  ├─ search:<base64-query>        (1 hour TTL)                │
│  ├─ session:<sessionId>          (24 hour TTL)               │
│  ├─ corpus:stats                 (1 hour TTL)                │
│                                                                 │
│  OPERATIONS:                                                  │
│  ├─ getFromCache (JSON deserialization)                      │
│  ├─ setInCache (with TTL)                                    │
│  ├─ invalidateSearchCaches (pattern delete)                  │
│  ├─ getCacheStats (memory + size info)                       │
│  └─ Graceful fallback (app works without cache)              │
│                                                                 │
└────────┬──────────────────────────────────────────────────────┘
         │
         │ Redis protocol
         │
┌────────▼──────────────────────────────────────────────────────┐
│          CORPUS DATA (14 Sources, 550+ Chunks)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  COVERAGE:                          CREDIBILITY:              │
│  • 13 African countries             • Official sources       │
│  • 80+ economic sectors             • High-tier NGOs         │
│  • 550+ text chunks                 • Community voices       │
│  • Zero Western bias                • Product reviews        │
│                                                                 │
│  CONTENT TYPES:                                               │
│  ├─ Government: Governance, policy                           │
│  ├─ NGO: Development, rights                                 │
│  ├─ Community: Indigenous knowledge                          │
│  ├─ Reference: Academic, research                            │
│  └─ Product: Real-world examples                             │
│                                                                 │
│  REGIONS:                           LANGUAGES:              │
│  BF (Burkina Faso)  KE (Kenya)     • French (Primary)       │
│  ML (Mali)          UG (Uganda)     • English                │
│  SN (Senegal)       TZ (Tanzania)   • Indigenous langs       │
│  CI (Côte d'Ivoire) ET (Ethiopia)   (in comments)            │
│  GH (Ghana)         RW (Rwanda)                              │
│  NG (Nigeria)       CM (Cameroon)                            │
│               ZA (South Africa)                              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Example: Chat API

```
User → POST /api/chat
   ↓
Next.js Route Handler
   ├─ Validate request
   ├─ Create/get session
   └─ Call ChatService
       ↓
   ChatService
   ├─ Create chat_session (if new)
   ├─ Store user message
   ├─ Call RAG retrieval
   │   ├─ Query → TF-IDF embedding
   │   ├─ PostgreSQL full-text search
   │   ├─ pgvector similarity search
   │   ├─ Geographic boost (by region)
   │   └─ Composite scoring
   └─ Hybrid score: [Lexical 60% + Credibility 20% + Geographic 20%]
       ↓
   Orchestrator
   ├─ Generate system prompt (profile-aware)
   ├─ Run agent turn (messages + retrieved chunks)
   └─ Synthesize evidence pack
       ↓
   RedisService
   ├─ Cache session data (24h TTL)
   └─ Cache search results (1h TTL)
       ↓
   Response: { sessionId, reply, citations, sources, performance }
   ↓
User receives answer with sources & timing
```

---

## 🔄 Request Flow Example: Vector Search API

```
User → POST /api/search/vector?query=...
   ↓
Next.js Route Handler
   ├─ Parse query + params
   ├─ Check Redis cache (getCachedSearchResults)
   └─ If NOT cached:
       ├─ Load corpus data
       ├─ Generate TF-IDF vector
       └─ Call VectorService
           ├─ If hybrid=true:
           │   ├─ pgvector cosine search
           │   ├─ Full-text search
           │   ├─ Weighted combination
           │   └─ Return top-k results
           └─ If hybrid=false:
               ├─ pgvector cosine distance
               ├─ Filter by minDistance threshold
               └─ Return top-k results
       ↓
   Store in Redis cache (1h TTL)
       ↓
Response: { resultCount, results[], mode, timestamp }
   ↓
User receives semantic results with similarity scores
```

---

## 📊 Data Model Example

```typescript
// CorpusSource (in corpus_sources table)
{
  id: UUID,
  title: "Agriculture & Agroécologie en Afrique de l'Ouest",
  filename: "agriculture-agroecologie-ouest-africain.md",
  source_type: "ngo",
  regions: ["BF", "ML", "SN", "CI"],
  credibility_tier: "high",
  description: "Comprehensive guide...",
  tags: ["agriculture", "sustainable", "west-africa"],
  is_active: true,
  created_at: "2025-01-01T00:00:00Z"
}

// CorpusChunk (in corpus_chunks table)
{
  id: UUID,
  source_id: UUID,
  chunk_index: 42,
  text: "La zaï est une technique traditionnelle...",
  keywords: ["zaï", "agriculture", "water-conservation"],
  created_at: "2025-01-01T00:00:00Z"
}

// ChunkEmbedding (in chunk_embeddings table + pgvector)
{
  chunk_id: UUID,
  model: "tfidf-l2-normalized",
  embedding: [0.15, -0.08, ..., 0.22],  // 1000 dimensions
  created_at: "2025-01-01T00:00:00Z"
}

// ChatSession (in chat_sessions table)
{
  id: UUID,
  user_id: "user-123",
  created_at: "2025-01-15T10:30:00Z",
  updated_at: "2025-01-15T10:45:00Z"
}

// ChatMessage (in chat_messages table)
{
  id: UUID,
  session_id: UUID,
  role: "user" | "assistant",
  content: "Comment faire entrepreneuriat...",
  retrieved_chunks: [UUID, UUID, ...],  // JSON array
  created_at: "2025-01-15T10:30:05Z"
}
```

---

## 🔐 Security Model

```
Authentication:
├─ Public endpoints: /api/chat, /api/search/vector (read-only)
├─ Protected endpoints: /api/admin/*, /api/cache (DELETE)
│   └─ Bearer token: Authorization: Bearer ADMIN_API_KEY
└─ Audit endpoints: /api/audit (log-only)

Authorization:
├─ Role-based (implicit)
│   ├─ User: Can only POST to /api/chat (create sessions)
│   ├─ Admin: Can DELETE/POST to /api/admin/* (manage corpus)
│   └─ System: Can call /api/health, /api/audit (monitoring)
└─ Row-level security: Audit logs track user + timestamp

Encryption:
├─ Transit: HTTPS (TLS 1.3)
├─ Database: PostgreSQL connection pooling with SSL
├─ Cache: Redis AUTH (optional in production)
└─ Secrets: Environment variables (.env.local, CI/CD secrets)
```

---

## 🚀 Deployment Architecture (Target)

```
┌─────────────────────────────────────────────────────┐
│           Production Environment                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Load Balancer (Nginx)                       │  │
│  │  • SSL termination                           │  │
│  │  • Request routing                           │  │
│  └──────────────────────────────────────────────┘  │
│         ↓ ↓ ↓ (3 instances)                        │
│  ┌──────────────────────────────────────────────┐  │
│  │  Next.js Containers (Docker)                 │  │
│  │  • Port 3000 (internal)                      │  │
│  │  • 2 CPU, 512MB RAM each                     │  │
│  │  • Auto-restart on crash                     │  │
│  └──────────────────────────────────────────────┘  │
│         ↓ ↓ ↓                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  PostgreSQL (Managed)                        │  │
│  │  • Multi-AZ replication                      │  │
│  │  • Automated backups                         │  │
│  │  • Connection pooling (PgBouncer)            │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Redis (Managed)                             │  │
│  │  • Cluster mode (3 nodes)                    │  │
│  │  • Persistence enabled                       │  │
│  │  • TTL eviction policy                       │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Monitoring Stack                            │  │
│  │  • CloudWatch / Datadog                      │  │
│  │  • Error tracking (Sentry)                   │  │
│  │  • Log aggregation (CloudWatch Logs)         │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📈 Performance Targets

| Component | Target | Notes |
|-----------|--------|-------|
| Chat API latency | <500ms | With warm cache |
| Vector search | <100ms | pgvector index |
| Cache hit ratio | >60% | Session + search |
| Memory/container | <512MB | Production |
| Throughput | 100+ concurrent | With 3 instances |
| DB connections | <20/instance | Connection pool |

---

## 🔗 Key Dependencies

```json
{
  "next": "16.2.4",
  "react": "19.2.4",
  "typescript": "5.9.3",
  "pg": "8.12.0",
  "@types/pg": "8.12.0",
  "redis": "4.6.13",
  "jest": "29.7.0",
  "@testing-library/react": "14.0.0",
  "@testing-library/jest-dom": "6.1.5"
}
```

---

**Architecture Version:** v0.3  
**Last Updated:** January 2025  
**Deployment Status:** Ready for production (pending final testing)
