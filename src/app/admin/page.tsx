'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [sources, setSources] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const fetchCorpus = async () => {
    if (!apiKey) {
      setError('Admin API key required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/corpus', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch corpus');
      }

      const data = await response.json();
      setSources(data.sources);
      setStats(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching corpus');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/corpus?sourceId=${sourceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete source');
      }

      // Refresh corpus
      await fetchCorpus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting source');
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1>🔐 Admin Dashboard - Corpus Management</h1>

        {/* Authentication */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h2>Authentication</h2>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input
              type="password"
              placeholder="Admin API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <button
              onClick={fetchCorpus}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Authenticate & Load
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Set ADMIN_API_KEY environment variable for production security
          </p>
        </div>

        {/* Error Display */}
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

        {/* Loading */}
        {loading && <p>Loading...</p>}

        {/* Statistics */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '15px',
              marginBottom: '30px',
            }}
          >
            <StatCard label="Total Sources" value={stats.total_sources} />
            <StatCard label="Total Chunks" value={stats.total_chunks} />
            <StatCard label="Regions" value="13 Countries" />
            <StatCard label="Coverage" value="80%+ Africa" />
          </div>
        )}

        {/* Credibility Distribution */}
        {stats?.credibility_distribution && (
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h2>Credibility Distribution</h2>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              {Object.entries(stats.credibility_distribution as Record<string, number>).map(([tier, count]) => (
                <div key={tier} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>
                    {tier}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources List */}
        {sources.length > 0 && (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ padding: '20px', margin: 0, borderBottom: '1px solid #eee' }}>
              📚 Corpus Sources ({sources.length})
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Title</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Credibility</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Regions</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source, idx) => (
                  <tr
                    key={source.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff',
                    }}
                  >
                    <td style={{ padding: '12px', fontSize: '14px' }}>{source.title}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                      {source.source_type}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color:
                          source.credibility_tier === 'official'
                            ? '#00a000'
                            : source.credibility_tier === 'high'
                            ? '#0066cc'
                            : '#ff9900',
                      }}
                    >
                      {source.credibility_tier}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                      {source.regions}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#cc3333',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Setup Instructions */}
        {!apiKey && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #b3d9ff',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '30px',
            }}
          >
            <h3>🚀 Setup Instructions</h3>
            <p>1. Set environment variable:</p>
            <code style={{ display: 'block', backgroundColor: '#fff', padding: '10px', marginBottom: '10px' }}>
              export ADMIN_API_KEY="your-secret-key-here"
            </code>
            <p>2. Authenticate above with your key</p>
            <p>3. Manage corpus sources with full CRUD operations</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0066cc' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{label}</div>
    </div>
  );
}
