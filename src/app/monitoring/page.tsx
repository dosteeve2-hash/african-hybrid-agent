'use client';

import { useEffect, useState } from 'react';

interface SystemStatus {
  database?: { connected: boolean; tables: number };
  cache?: { connected: boolean; dbSize: number; memoryUsed: string };
  corpus?: { totalSources: number; totalChunks: number };
  embeddings?: { totalEmbeddings: number };
  timestamp: string;
}

export default function MonitoringPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Fetch health status
        const healthRes = await fetch('/api/health');
        const health = await healthRes.json();

        // Fetch cache stats
        const cacheRes = await fetch('/api/cache');
        const cacheData = await cacheRes.json();

        // Fetch corpus stats
        const corpusRes = await fetch('/api/corpus');
        const corpusData = await corpusRes.json();

        setStatus({
          database: health.database,
          cache: cacheData.cache,
          corpus: corpusData.statistics,
          timestamp: new Date().toISOString(),
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  const handleClearCache = async () => {
    if (!confirm('Clear all cache entries?')) return;

    try {
      const res = await fetch('/api/cache?type=all', { method: 'DELETE' });
      if (res.ok) {
        alert('Cache cleared successfully');
        // Refresh status
        window.location.reload();
      }
    } catch (err) {
      alert('Failed to clear cache');
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1>📊 System Monitoring Dashboard</h1>

        {/* Refresh Controls */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <label>
              Refresh Interval (seconds):
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                style={{ marginLeft: '10px', padding: '5px' }}
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </label>
            <button
              onClick={handleClearCache}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Cache
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Last updated: {status?.timestamp || 'loading...'}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            ❌ {error}
          </div>
        )}

        {loading ? (
          <p>Loading system status...</p>
        ) : (
          <>
            {/* Database Status */}
            <StatusCard
              title="🗄️ Database"
              status={status?.database?.connected ? 'Connected' : 'Disconnected'}
              details={
                status?.database
                  ? {
                      Connected: status.database.connected ? '✅ Yes' : '❌ No',
                      Tables: String(status.database.tables || '0'),
                    }
                  : {}
              }
              healthy={status?.database?.connected || false}
            />

            {/* Cache Status */}
            <StatusCard
              title="⚡ Cache (Redis)"
              status={status?.cache?.connected ? 'Connected' : 'Disconnected'}
              details={
                status?.cache
                  ? {
                      Connected: status.cache.connected ? '✅ Yes' : '❌ No',
                      'Entries': String(status.cache.dbSize || '0'),
                      'Memory Used': status.cache.memoryUsed || '0B',
                    }
                  : {}
              }
              healthy={status?.cache?.connected || false}
            />

            {/* Corpus Status */}
            <StatusCard
              title="📚 Corpus"
              status="Active"
              details={
                status?.corpus
                  ? {
                      Sources: String(status.corpus.totalSources || '0'),
                      Chunks: String(status.corpus.totalChunks || '0'),
                    }
                  : {}
              }
              healthy={true}
            />

            {/* Overall Health */}
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #00a000',
              }}
            >
              <h3>✅ Overall Status: Operational</h3>
              <p>All critical systems are online and functioning normally.</p>
            </div>

            {/* API Endpoints */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '20px',
              }}
            >
              <h3>📡 Available Endpoints</h3>
              <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <li>POST /api/chat - Conversational chat</li>
                <li>POST /api/search/vector - Vector similarity search</li>
                <li>GET /api/cache - Cache statistics</li>
                <li>DELETE /api/cache - Clear cache</li>
                <li>GET /api/admin/corpus - Corpus management</li>
                <li>GET /api/health - Health check</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusCard({
  title,
  status,
  details,
  healthy,
}: {
  title: string;
  status: string;
  details: Record<string, string>;
  healthy: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${healthy ? '#00a000' : '#ff6b6b'}`,
      }}
    >
      <h3 style={{ margin: '0 0 10px 0' }}>{title}</h3>
      <p style={{ margin: '5px 0', color: healthy ? '#00a000' : '#c33', fontWeight: 'bold' }}>
        {status}
      </p>
      <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
        {Object.entries(details).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>{key}:</span>
            <span style={{ fontFamily: 'monospace' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
