import React, { useState } from 'react';

interface ReportRow {
  page_url: string;
  h1: string;
  first_paragraph: string;
  outgoing_link_urls: string;
  image_urls: string;
}

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [maxConcurrency, setMaxConcurrency] = useState(5);
  const [maxPages, setMaxPages] = useState(25);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportRow[]>([]);
  const [error, setError] = useState('');

  // Placeholder for triggering the backend crawl and fetching CSV
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReport([]);
    try {
  const response = await fetch(`http://localhost:8080/api/crawl?url=${encodeURIComponent(url)}&maxConcurrency=${maxConcurrency}&maxPages=${maxPages}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const csv = await response.text();
      const rows = csv.trim().split('\n').map(line => line.split(','));
      const [header, ...data] = rows;
      setReport(data.map(row => Object.fromEntries(header.map((h, i) => [h, row[i]])) as unknown as ReportRow));
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ background: '#2563eb', color: 'white', padding: '1.5rem 0', marginBottom: 32, boxShadow: '0 2px 8px #0001' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontWeight: 700, fontSize: 32, letterSpacing: 1, margin: 0 }}>goScraper</h1>
          <span style={{ fontSize: 16, opacity: 0.85 }}>A Modern Go Web Crawler</span>
        </div>
      </header>
  <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', flex: 1 }}>
        <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px #0002', padding: 32, marginBottom: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{ fontWeight: 500, color: '#2563eb', marginBottom: 6, display: 'block' }}>Website URL</label>
              <input type="url" value={url} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} placeholder="https://example.com" />
            </div>
            <div style={{ minWidth: 160 }}>
              <label style={{ fontWeight: 500, color: '#2563eb', marginBottom: 6, display: 'block' }}>Max Concurrency</label>
              <input type="number" min={1} max={20} value={maxConcurrency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxConcurrency(Number(e.target.value))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ minWidth: 160 }}>
              <label style={{ fontWeight: 500, color: '#2563eb', marginBottom: 6, display: 'block' }}>Max Pages</label>
              <input type="number" min={1} max={1000} value={maxPages} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxPages(Number(e.target.value))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 600, fontSize: 18, boxShadow: '0 2px 8px #2563eb22', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>{loading ? 'Crawling...' : 'Start Crawl'}</button>
          </form>
          {error && <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, marginTop: 18, fontWeight: 500 }}>{error}</div>}
        </div>
        {report.length > 0 && (
          <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px #0002', padding: 24, marginBottom: 32, overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: 900, width: '100%', fontSize: 15 }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #2563eb11 0%, #60a5fa11 100%)' }}>
                  <th style={{ minWidth: 180, padding: '10px 8px', fontWeight: 700, color: '#2563eb', borderBottom: '2px solid #e0e7ef' }}>Page URL</th>
                  <th style={{ minWidth: 120, padding: '10px 8px', fontWeight: 700, color: '#2563eb', borderBottom: '2px solid #e0e7ef' }}>H1</th>
                  <th style={{ minWidth: 180, padding: '10px 8px', fontWeight: 700, color: '#2563eb', borderBottom: '2px solid #e0e7ef' }}>First Paragraph</th>
                  <th style={{ minWidth: 180, padding: '10px 8px', fontWeight: 700, color: '#2563eb', borderBottom: '2px solid #e0e7ef' }}>Outgoing Links</th>
                  <th style={{ minWidth: 320, padding: '10px 8px', fontWeight: 700, color: '#2563eb', borderBottom: '2px solid #e0e7ef' }}>Image URLs</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e0e7ef', background: i % 2 === 0 ? '#f8fafc' : 'white' }}>
                    <td style={{ wordBreak: 'break-all', padding: '8px 6px' }}>{row.page_url}</td>
                    <td style={{ wordBreak: 'break-all', padding: '8px 6px' }}>{row.h1}</td>
                    <td style={{ wordBreak: 'break-all', padding: '8px 6px' }}>{row.first_paragraph}</td>
                    <td style={{ wordBreak: 'break-all', padding: '8px 6px' }}>{row.outgoing_link_urls}</td>
                    <td style={{ wordBreak: 'break-all', minWidth: 320, padding: '8px 6px' }}>{row.image_urls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <footer style={{ textAlign: 'center', color: '#64748b', fontSize: 15, padding: '2rem 0 1rem 0', opacity: 0.8 }}>
        &copy; {new Date().getFullYear()} goScraper. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
