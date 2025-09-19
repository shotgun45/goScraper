import React, { useState } from 'react';
// Helper to convert report data to CSV string
function toCSV(rows: ReportRow[]): string {
  if (!rows.length) return '';
  const header = Object.keys(rows[0]);
  const csvRows = [header.join(',')];
  for (const row of rows) {
    csvRows.push(header.map(h => '"' + String(row[h as keyof ReportRow] ?? '').replace(/"/g, '""') + '"').join(','));
  }
  return csvRows.join('\n');
}

interface ReportRow {
  page_url: string;
  h1: string;
  first_paragraph: string;
  outgoing_link_urls: string;
  image_urls: string;
}

const App: React.FC = () => {
  const DEFAULT_URL = '';
  const DEFAULT_CONCURRENCY = 5;
  const DEFAULT_MAX_PAGES = 25;
  const [url, setUrl] = useState(DEFAULT_URL);
  const [maxConcurrency, setMaxConcurrency] = useState(DEFAULT_CONCURRENCY);
  const [maxPages, setMaxPages] = useState(DEFAULT_MAX_PAGES);
  const handleClear = () => {
    setUrl(DEFAULT_URL);
    setMaxConcurrency(DEFAULT_CONCURRENCY);
    setMaxPages(DEFAULT_MAX_PAGES);
    if (report.length > 0) setReport([]);
  };
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportRow[]>([]);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const toggleRow = (idx: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

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

  // Save report as CSV file
  const handleSave = () => {
    const csv = toCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'goScraper_report.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ background: '#2563eb', color: 'white', padding: '1.5rem 0', marginBottom: 32, boxShadow: '0 2px 8px #0001' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flexBasis: '50%', textAlign: 'left' }}>
            <h1 style={{ fontWeight: 700, fontSize: 32, letterSpacing: 1, margin: 0 }}>goScraper</h1>
          </div>
          <div style={{ flexBasis: '50%', textAlign: 'right' }}>
            <span style={{ fontSize: 16, opacity: 0.85 }}>A Go Based Web Crawler</span>
          </div>
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
            <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 600, fontSize: 18, boxShadow: '0 2px 8px #2563eb22', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginRight: 12 }}>{loading ? 'Crawling...' : 'Start Crawl'}</button>
            <button type="button" onClick={handleClear} disabled={loading} style={{ background: '#f3f4f6', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: 8, padding: '12px 32px', fontWeight: 600, fontSize: 18, boxShadow: '0 2px 8px #2563eb11', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>Reset</button>
          </form>
          {error && <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, marginTop: 18, fontWeight: 500 }}>{error}</div>}
        </div>
        {report.length > 0 && (
          <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px #0002', padding: 24, marginBottom: 32, overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={handleSave} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #22c55e22', cursor: 'pointer', transition: 'background 0.2s' }}>
                Save Report
              </button>
            </div>
            <table style={{ borderCollapse: 'collapse', minWidth: 500, width: '100%', fontSize: 15 }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #2563eb11 0%, #60a5fa11 100%)' }}>
                  <th style={{ minWidth: 40, width: 40 }}></th>
                  <th style={{ minWidth: 180, padding: '10px 8px', fontWeight: 700, color: '#2563eb', borderBottom: '2px solid #e0e7ef' }}>Page URL</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row, i) => (
                  <React.Fragment key={i}>
                    <tr style={{ borderBottom: '1px solid #e0e7ef', background: i % 2 === 0 ? '#f8fafc' : 'white' }}>
                      <td style={{ textAlign: 'center', padding: '8px 0' }}>
                        <button
                          aria-label={expandedRows.has(i) ? 'Collapse row' : 'Expand row'}
                          onClick={() => toggleRow(i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#2563eb', outline: 'none' }}
                        >
                          {expandedRows.has(i) ? '▼' : '▶'}
                        </button>
                      </td>
                      <td style={{ wordBreak: 'break-all', padding: '8px 6px', fontWeight: 600 }}>{row.page_url}</td>
                    </tr>
                    {expandedRows.has(i) && (
                      <tr style={{ background: '#f1f5f9' }}>
                        <td colSpan={2} style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                            <div style={{ minWidth: 180 }}>
                              <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>H1</div>
                              <div style={{ wordBreak: 'break-all' }}>{row.h1}</div>
                            </div>
                            <div style={{ minWidth: 180 }}>
                              <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>First Paragraph</div>
                              <div style={{ wordBreak: 'break-all' }}>{row.first_paragraph}</div>
                            </div>
                            <div style={{ minWidth: 180 }}>
                              <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>Outgoing Links</div>
                              <div style={{ wordBreak: 'break-all' }}>{row.outgoing_link_urls}</div>
                            </div>
                            <div style={{ minWidth: 320 }}>
                              <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>Image URLs</div>
                              <div style={{ wordBreak: 'break-all' }}>{row.image_urls}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
