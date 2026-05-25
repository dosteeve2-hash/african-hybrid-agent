'use client';

import { useState } from 'react';

export default function CorpusPage() {
  return <CorpusExplorerDashboard />;
}

export function CorpusExplorerDashboard() {
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sources = [
    {
      title: 'Santé et Éducation en Afrique de l\'Ouest',
      filename: 'sante-education-afrique-ouest.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG'],
      credibility: 'high',
      chunks: 60,
      topics: ['santé', 'éducation', 'formation', 'nutrition', 'mentalité'],
      keywords: ['accès santé', 'qualité eau', 'vaccination', 'employabilité'],
    },
    {
      title: 'Eau, Assainissement et Hygiène',
      filename: 'eau-assainissement-hygiene-afrique.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'TZ', 'ET', 'RW'],
      credibility: 'high',
      chunks: 50,
      topics: ['eau', 'assainissement', 'hygiène', 'santé'],
      keywords: ['accès eau', 'toilettes', 'Bio-sand', 'choléra'],
    },
    {
      title: 'Énergie Renouvelable et Électricité',
      filename: 'energie-renouvelable-electricite.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM', 'ZA'],
      credibility: 'high',
      chunks: 55,
      topics: ['énergie', 'électricité', 'solaire', 'efficacité'],
      keywords: ['off-grid SHS', 'mini-grids', 'LPG', 'LED efficiency'],
    },
    {
      title: 'Pêche, Aquaculture et Ressources Marines',
      filename: 'peche-aquaculture-ressources-marines.md',
      regions: ['SN', 'CI', 'GH', 'NG', 'KE', 'TZ', 'MZ', 'ZA'],
      credibility: 'high',
      chunks: 48,
      topics: ['pêche', 'aquaculture', 'ressources marines', 'durabilité'],
      keywords: ['pêche artisanale', 'tilapia', 'transformation poisson'],
    },
    {
      title: 'Droit Foncier et Conflits Terre',
      filename: 'droit-foncier-propriete-conflits-terre.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ'],
      credibility: 'high',
      chunks: 52,
      topics: ['droit foncier', 'propriété', 'conflits', 'cadastre'],
      keywords: ['tenure', 'femmes droits', 'digitalisation cadastre'],
    },
    {
      title: 'Transport, Logistique et Commerce',
      filename: 'transport-logistique-commerce-local.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM'],
      credibility: 'high',
      chunks: 55,
      topics: ['transport', 'logistique', 'commerce', 'e-commerce'],
      keywords: ['chaînes valeur', 'mini-grids', 'AfCFTA'],
    },
    {
      title: 'Changement Climatique et Résilience',
      filename: 'changement-climatique-resilience.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM', 'ZA'],
      credibility: 'high',
      chunks: 58,
      topics: ['climat', 'résilience', 'agriculture', 'conservation'],
      keywords: ['sécheresse', 'variétés adaptées', 'reforestation'],
    },
    {
      title: 'Genre, Femmes et Droits',
      filename: 'genre-femmes-droits.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM'],
      credibility: 'high',
      chunks: 52,
      topics: ['genre', 'femmes', 'droits', 'autonomisation'],
      keywords: ['entrepreneuriat', 'violence', 'santé reproductive'],
    },
    {
      title: 'Artisanat Traditionnel et Commerce Créatif',
      filename: 'artisanat-commerce-creaitif.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'CM', 'KE', 'ET', 'UG'],
      credibility: 'high',
      chunks: 50,
      topics: ['artisanat', 'créatif', 'commerce', 'tourisme'],
      keywords: ['tissage', 'céramique', 'fair-trade', 'e-commerce'],
    },
    {
      title: 'Jeunesse, Employabilité et Opportunités',
      filename: 'jeunesse-employabilite.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM', 'ZA'],
      credibility: 'high',
      chunks: 58,
      topics: ['jeunesse', 'emploi', 'entrepreneuriat', 'digital'],
      keywords: ['apprenticeship', 'startup', 'creative economy'],
    },
    {
      title: 'Gouvernance Locale Burkina',
      filename: 'gouvernance-locale-burkina.md',
      regions: ['BF'],
      credibility: 'official',
      chunks: 25,
      topics: ['gouvernance', 'civil society', 'local'],
      keywords: ['chefs', 'municipalités', 'participation'],
    },
    {
      title: 'Agriculture & Agroécologie Ouest-Africaine',
      filename: 'agriculture-agroecologie-ouest-africain.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH'],
      credibility: 'high',
      chunks: 35,
      topics: ['agriculture', 'agroécologie', 'productivité'],
      keywords: ['zaï', 'demi-lune', 'niébé', 'viabilité économique'],
    },
    {
      title: 'Entrepreneuriat Femmes & Inclusion Financière',
      filename: 'entrepreneuriat-femmes-inclusion-financiere.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG'],
      credibility: 'high',
      chunks: 30,
      topics: ['entrepreneuriat', 'femmes', 'finance', 'tontines'],
      keywords: ['microfinance', 'tontines', 'secteurs viables'],
    },
    {
      title: 'Numérique & Innovation Afrique',
      filename: 'numerique-innovation-afrique.md',
      regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'TZ', 'ET'],
      credibility: 'medium',
      chunks: 28,
      topics: ['numérique', 'innovation', 'technologie'],
      keywords: ['4G', 'paiement mobile', 'agriculture digitale'],
    },
  ];

  const filtered = sources.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2>🔍 Explorer Corpus</h2>
        <p>Explore {sources.length} sources couvrant l'économie africaine</p>
        
        <input
          type="text"
          placeholder="Chercher par titre, topic, ou keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            border: '2px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filtered.map((source, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedSource(selectedSource === idx ? null : idx)}
            style={{
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backgroundColor: selectedSource === idx ? '#f0f7ff' : '#fff',
              borderColor: selectedSource === idx ? '#0066cc' : '#e0e0e0',
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{source.title}</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <span style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px', marginRight: '5px' }}>
                📊 {source.chunks} chunks
              </span>
              <span style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
                ⭐ {source.credibility}
              </span>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>Régions:</strong> {source.regions.join(', ')}
            </div>

            {selectedSource === idx && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Topics:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                    {source.topics.map((t, i) => (
                      <span key={i} style={{ padding: '3px 8px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Keywords:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                    {source.keywords.map((k, i) => (
                      <span key={i} style={{ padding: '3px 8px', backgroundColor: '#fff3e0', borderRadius: '4px', fontSize: '12px' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📈 Statistiques Corpus</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>{sources.length}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Sources</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>{sources.reduce((sum, s) => sum + s.chunks, 0)}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Chunks</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>{new Set(sources.flatMap(s => s.regions)).size}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Régions Couvertes</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>{new Set(sources.flatMap(s => s.topics)).size}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Topics Uniques</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3>💡 Utilisation</h3>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li>Cliquez sur une source pour voir détails + keywords</li>
          <li>Utilisez la barre recherche pour filtrer par topic/keyword</li>
          <li>Le système utilise TF-IDF + synonymes pour retrieval sémantique</li>
          <li>Toutes sources incluent contexte authentique africain + données réelles</li>
        </ul>
      </div>
    </div>
  );
}
