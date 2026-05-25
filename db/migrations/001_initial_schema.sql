-- Schema migrations for African Hybrid Agent PostgreSQL database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- ============================================================================
-- CORPUS SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS corpus_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  filename VARCHAR(255) UNIQUE NOT NULL,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('ngo', 'government', 'community', 'reference', 'product')),
  regions VARCHAR(500), -- Comma-separated codes: BF,ML,SN
  credibility_tier VARCHAR(50) NOT NULL CHECK (credibility_tier IN ('official', 'high', 'medium', 'low')),
  description TEXT,
  tags VARCHAR(500), -- Comma-separated tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- CORPUS CHUNKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS corpus_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES corpus_sources(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  tokens INTEGER,
  embedding vector(1536), -- For pgvector similarity search (optional)
  keywords VARCHAR(500), -- Extracted keywords
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_id, chunk_index)
);

-- Index for fast retrieval
CREATE INDEX IF NOT EXISTS idx_corpus_chunks_source_id ON corpus_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_corpus_chunks_embedding ON corpus_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- CHAT HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  retrieved_chunks JSONB, -- Chunks used for this response
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for chat history
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'trace')),
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast audit retrieval
CREATE INDEX IF NOT EXISTS idx_audit_logs_component ON audit_logs(component);
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- EVIDENCE PACKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_or_profile JSONB NOT NULL,
  retrieved_chunks JSONB NOT NULL,
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- P2P PROFILES TABLE (integration with Problem to Project Africa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS p2p_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country VARCHAR(100),
  region VARCHAR(100),
  sector VARCHAR(100),
  preferred_sector VARCHAR(100),
  observed_problem TEXT,
  skills VARCHAR(500), -- JSON array as string
  constraints VARCHAR(500), -- JSON array as string
  trust_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- API USAGE STATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INTEGER,
  response_time_ms INTEGER,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for usage analytics
CREATE INDEX IF NOT EXISTS idx_api_usage_stats_endpoint ON api_usage_stats(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_stats_created_at ON api_usage_stats(created_at DESC);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Corpus coverage by region
CREATE OR REPLACE VIEW corpus_coverage_by_region AS
SELECT 
  UNNEST(STRING_TO_ARRAY(regions, ',')) as region,
  COUNT(DISTINCT id) as source_count,
  COUNT(DISTINCT (SELECT COUNT(*) FROM corpus_chunks WHERE source_id = cs.id)) as chunk_count
FROM corpus_sources cs
WHERE is_active = true
GROUP BY region;

-- Recent audit activity
CREATE OR REPLACE VIEW recent_audit_activity AS
SELECT 
  component,
  level,
  action,
  COUNT(*) as count,
  created_at
FROM audit_logs
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY component, level, action, created_at
ORDER BY created_at DESC;

-- Session statistics
CREATE OR REPLACE VIEW session_statistics AS
SELECT 
  DATE(cs.created_at) as date,
  COUNT(DISTINCT cs.id) as session_count,
  COUNT(cm.id) as message_count,
  AVG(ARRAY_LENGTH(AGG(cm.content), 1)) as avg_messages_per_session
FROM chat_sessions cs
LEFT JOIN chat_messages cm ON cs.id = cm.session_id
GROUP BY DATE(cs.created_at)
ORDER BY date DESC;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update timestamps
CREATE TRIGGER update_corpus_sources_updated_at BEFORE UPDATE ON corpus_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_p2p_profiles_updated_at BEFORE UPDATE ON p2p_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Full-text search on chunks
CREATE INDEX IF NOT EXISTS idx_corpus_chunks_text_search ON corpus_chunks USING GIN (to_tsvector('french', text));

-- Performance monitoring
CREATE INDEX IF NOT EXISTS idx_api_usage_stats_user_id ON api_usage_stats(user_id);

-- ============================================================================
-- PERMISSIONS (example for read-only user)
-- ============================================================================

-- CREATE USER agent_readonly WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE african_agent TO agent_readonly;
-- GRANT USAGE ON SCHEMA public TO agent_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO agent_readonly;
